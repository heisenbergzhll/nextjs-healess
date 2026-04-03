import Grid from '@mui/material/Grid';
import { getFormattedPrice, isValidArray } from '@utils/Helper';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import { ProductItemInterface } from '@voguish/module-catalog/types';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import { useUpdateCartItems } from '@voguish/module-quote/hooks/cart-handler';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { decode } from 'base-64';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import {
  JSXElementConstructor,
  Key,
  ReactElement,
  ReactFragment,
  ReactPortal,
  useEffect,
  useState,
} from 'react';
import { FieldValues, SubmitHandler, useForm } from 'react-hook-form';
import { CircularProgress, Stack } from '@mui/material';
import { WHITE_HEX_CODE } from '@utils/Constants';
const Actions = dynamic(() => import('./Actions'), { ssr: false });
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUp from '@mui/icons-material/KeyboardArrowUp';
const BundleItem = dynamic(() => import('./BundleItem'), { ssr: false });
const DownloadableItem = dynamic(() => import('./DownloadableItem'), {
  ssr: false,
});
const AddToWishlist = dynamic(
  () =>
    import('@voguish/module-catalog/Components/Product/Detail/AddToWishlist'),
  {
    loading: () => (
      <div className="h-10 rounded-md max-w-[40rem] w-full animate-pulse bg-neutral-300" />
    ),
    ssr: false,
  }
);

export interface CartItems {
  product?: ProductItemInterface;
  qty?: number;
  cartItemId?: string;
  page?: boolean;
  isPayment?: boolean;
  selectedShippingMethod?: any[];
  showShippingOptions?: boolean;
  shippingLoading?: boolean | object;
  showAddToActions?: boolean;
  onClick?: Function;
  cartItem?:
    | {
        cart_item_id?: number;
        cart_item_uid?: string;
        quantity?: number;
      }
    | any;
}

export const CartItem = (props: CartItems) => {
  const isCartPage = false || props.page;
  /**
   * Cart Item from props
   */
  const cartItem = props?.cartItem;
  const [incrementLoading, setIncrementLoader] = useState(false);
  const [decrementLoading, setDecrementLoader] = useState(false);

  /**
   * Update Cart Item handler
   * updateCartItemsHandler - Handler to update the cart items.
   * isInProgress - Request is in Progress.
   */
  const { updateCartItemsHandler, isInProcess } = useUpdateCartItems();

  /**
   * Show Loading while request for submitting the request
   */

  const { register, handleSubmit, setValue, getValues } = useForm();

  /**
   * Form Submit handler to update quantity.
   * @param {Object} data - form data
   */
  const updateCartItem = (data: CartItems) => {
    updateCartItemsHandler([
      {
        cart_item_id: Number(decode(cartItem?.cartItemId)),
        quantity: data?.qty,
      },
    ]);
  };

  useEffect(() => {
    if (!isInProcess) {
      setIncrementLoader(false);
      setDecrementLoader(false);
    }
  }, [isInProcess]);
  // Sync local qty to react-hook-form on load

  const actionChooseQty = async (type = 'increment') => {
    const value = getValues('qty');
    const oldValue = parseInt(value || '1');
    let newValue = oldValue;

    if (type === 'decrement' && oldValue > 1) {
      newValue = oldValue - 1;
    }
    if (type === 'increment' && oldValue < 5) {
      newValue = oldValue + 1;
    }

    if (newValue !== oldValue) {
      setValue('qty', newValue);
      if (type === 'increment') {
        setIncrementLoader(true);
      } else {
        setDecrementLoader(true);
      }
      try {
        await updateCartItemsHandler([
          {
            cart_item_id: Number(decode(cartItem?.cartItemId)),
            quantity: newValue,
          },
        ]);
      } catch (err) {
        setValue('qty', oldValue);
        setIncrementLoader(false);
        setDecrementLoader(false);
      }
    }
  };

  const { product, prices, bundle_options, samples, customizable_options } =
    cartItem;

  /**
   * Item Price
   */
  const itemPrice = getFormattedPrice(
    prices?.price?.value,
    prices?.price?.currency
  );

  /**
   * Subtotal
   */
  const subTotal = getFormattedPrice(
    prices?.row_total?.value,
    prices?.row_total?.currency
  );
  const token = useToken();
  const [moreInfo, setMoreInfo] = useState(false);
  const items = cartItem?.configurable_options?.map((item: Config) => item);
  const { t } = useTranslation('common');

  return (
    <ErrorBoundary>
      <Grid className="flex w-full gap-x-3 sm:items-start -3xs:grid">
        <Link href={`/catalog/product/${product?.url_key}`}>
          <div className="pt-1 -3xs:flex -3xs:justify-center">
            <Thumbnail
              onClick={props.onClick}
              className="object-contain border border-solid border-commonBorder -3xs:mx-auto"
              thumbnail={product?.thumbnail?.url}
              height={110}
              width={108}
              alt={product?.name}
            />
          </div>
        </Link>
        <Grid className="flex flex-col gap-1 -3xs:pt-7" width="100%">
          <div className="flex items-start justify-between w-full">
            {product?.name && (
              <h2 className="w-full py-0 my-0 leading-6">
                <Link href={`/catalog/product/${product?.url_key}`}>
                  <HTMLRenderer
                    onClick={props.onClick}
                    className="my-0 max-h-fit min-w-full cursor-pointer break-words text-[1.125rem] font-normal"
                    htmlText={product?.name || ''}
                  />
                </Link>
              </h2>
            )}
            <span className="mx-0.5 mt-0.5">
              {props.showAddToActions && (
                <Actions cartItemId={cartItem?.cartItemId} />
              )}
            </span>
          </div>{' '}
          <div className="flex flex-col w-full gap-2">
            {product?.description?.html && (
              <h3 className="py-0 my-0 leading-4">
                <HTMLRenderer
                  className={`${isCartPage ? '' : 'line-clamp-2'} max-w-[86%] break-words text-sm font-normal text-reviewText`}
                  htmlText={product?.description?.html}
                />
              </h3>
            )}
            {customizable_options?.map(
              (option: {
                sort_order: number;
                label: string;
                values: { label: string }[];
              }) => (
                <div key={option?.sort_order}>
                  <p className="text-sm font-semibold text-black">
                    {option?.label}
                  </p>
                  {option?.values?.map((item, index: number) => (
                    <div key={index}>
                      <p className="py-0 my-0 text-xs font-medium text-brand">
                        {item?.label}
                      </p>
                    </div>
                  ))}
                </div>
              )
            )}
            {isValidArray(items) && (
              <span className="flex flex-col gap-1.5">
                {items.map((option: Config, index: Key | null | undefined) => (
                  <p
                    key={index}
                    className="flex items-center py-0 my-0 gap-x-2 text-sm font-medium leading-normal lg:leading-[1.45rem]"
                  >
                    <span className="font-semibold">
                      {option.option_label} :
                    </span>
                    <span>{option.value_label}</span>
                  </p>
                ))}
              </span>
            )}
            <span className="hidden md:flex">
              {' '}
              <BundleItem bundle_options={bundle_options} />
            </span>
            {product?.__typename === 'BundleProduct' && (
              <ErrorBoundary>
                <button
                  className="flex items-center px-0 text-sm font-semibold bg-transparent border-0 max-w-fit md:hidden"
                  onClick={() => setMoreInfo(!moreInfo)}
                >
                  More Info{' '}
                  <KeyboardArrowDown
                    className={`text-xl text-white ${
                      moreInfo ? 'fa-arrow-down-close' : 'fa-arrow-down'
                    }`}
                  />
                </button>
                {moreInfo && (
                  <span className="md:hidden">
                    <BundleItem bundle_options={bundle_options} />
                  </span>
                )}
              </ErrorBoundary>
            )}
            {product?.__typename === 'DownloadableProduct' && (
              <DownloadableItem product={samples} />
            )}
            <Stack className="grid gap-2" width="100%" alignItems="center">
              <p className="gap-nowrap py-0 my-0 !capitalize leading-normal text-brand lg:leading-[1.25rem]">
                {product?.stock_status?.replace(/[^a-z0-9]/gi, ' ')}
              </p>
            </Stack>
            <form
              onSubmit={handleSubmit(
                updateCartItem as SubmitHandler<FieldValues>
              )}
              className="min-w-fit py-1.5 sm:hidden -sm:flex-[1_1_100%]"
            >
              <Grid className="flex items-center mx-auto gap-x-2">
                <p className="ltr:pr-1.5 py-0 my-0 rtl:pl-1.5">{t('Qty :')}</p>
                <span className="flex justify-center">
                  <button
                    aria-label="decrement"
                    className={`cursor-pointer h-6 w-6 justify-center flex items-center shadow-none bg-brand text-black border-0 rounded ${
                      cartItem?.quantity > 1 && 'hover:bg-brand'
                    } hover:contrast-75`}
                    onClick={() => {
                      actionChooseQty('decrement');
                    }}
                    disabled={
                      !(cartItem?.quantity <= 5 && cartItem?.quantity > 1)
                    }
                  >
                    {isInProcess && decrementLoading ? (
                      <div className="grid">
                        <CircularProgress
                          size={15}
                          style={{ color: WHITE_HEX_CODE, margin: 'auto' }}
                        />
                      </div>
                    ) : (
                      <KeyboardArrowDown className="text-white" />
                    )}
                  </button>
                  <label className="capitalize sr-only" htmlFor="quantity">
                    {t('Quantity')}
                  </label>
                  <input
                    max={5}
                    readOnly
                    type="number"
                    className="hiddenInputButtons readonly text-md relative mx-auto flex max-w-[3rem] cursor-pointer items-center border-none px-3 text-center text-lg font-semibold text-gray-700 outline-none hover:text-black focus:text-black focus:outline-none md:text-base"
                    min={1}
                    id="qty"
                    {...register('qty', {
                      value: cartItem?.quantity,
                      required: t('%1 is required.'),
                      min: {
                        value: 1,
                        message: t('minimum value'),
                      },
                      max: {
                        value: 5,
                        message: t('maximum value'),
                      },
                    })}
                    placeholder="0"
                  />
                  <button
                    aria-label="increment"
                    className={`cursor-pointer h-6 w-6 justify-center flex items-center shadow-none bg-brand text-black border-0 rounded ${
                      cartItem?.quantity > 1 && 'hover:bg-brand'
                    } hover:contrast-75`}
                    onClick={() => {
                      actionChooseQty('increment');
                    }}
                    disabled={!(cartItem?.quantity < 5)}
                  >
                    {isInProcess && incrementLoading ? (
                      <div className="grid">
                        <CircularProgress
                          size={15}
                          style={{ color: WHITE_HEX_CODE, margin: 'auto' }}
                        />
                      </div>
                    ) : (
                      <KeyboardArrowUp className="text-white" />
                    )}
                  </button>
                </span>
              </Grid>
            </form>
          </div>
        </Grid>
      </Grid>
      <div>
        <div className="flex justify-between gap-4 min-w-fit -sm:flex-wrap">
          <form
            onSubmit={handleSubmit(
              updateCartItem as SubmitHandler<FieldValues>
            )}
            className="pt-4 pb-3 min-w-fit -sm:hidden"
          >
            <Grid className="flex items-center gap-x-2 -md:justify-center">
              <p className="ltr:pr-1.5 py-0 my-0 rtl:pl-1.5">{t('Qty :')}</p>
              <span className="flex justify-center">
                <button
                  className={`cursor-pointer shadow-none bg-brand flex justify-center items-center h-8 w-8 text-black border-0 rounded ${
                    cartItem?.quantity > 1 && 'hover:bg-brand'
                  } hover:contrast-75  ${isInProcess && ' cursor-progress '}`}
                  onClick={() => {
                    actionChooseQty('decrement');
                  }}
                  disabled={
                    isInProcess ||
                    !(cartItem?.quantity <= 5 && cartItem?.quantity > 1)
                  }
                >
                  {isInProcess && decrementLoading ? (
                    <div className="grid">
                      <CircularProgress
                        size={15}
                        style={{ color: WHITE_HEX_CODE, margin: 'auto' }}
                      />
                    </div>
                  ) : (
                    <KeyboardArrowDown className="text-white" />
                  )}
                </button>
                <label className="capitalize sr-only" htmlFor="quantity">
                  {t('Quantity')}
                </label>
                <input
                  max={5}
                  readOnly
                  type="number"
                  className="hiddenInputButtons readonly text-md relative mx-auto flex max-w-[3rem] cursor-pointer items-center border-none px-3 text-center text-lg font-semibold text-gray-700 outline-none hover:text-black focus:text-black focus:outline-none md:text-base"
                  min={1}
                  id="qty"
                  {...register('qty', {
                    value: cartItem?.quantity,
                    required: t('%1 is required.'),
                    min: {
                      value: 1,
                      message: t('minimum value'),
                    },
                    max: {
                      value: 5,
                      message: t('maximum value'),
                    },
                  })}
                  placeholder="0"
                />
                <button
                  className={`flex items-center justify-center w-8 h-8 text-black border-0 rounded shadow-none cursor-pointer bg-brand hover:bg-brand hover:contrast-75 ${isInProcess && ' cursor-progress '}`}
                  onClick={() => {
                    actionChooseQty('increment');
                  }}
                  disabled={isInProcess || !(cartItem?.quantity < 5)}
                >
                  {isInProcess && incrementLoading ? (
                    <div className="grid">
                      <CircularProgress
                        size={15}
                        style={{ color: WHITE_HEX_CODE, margin: 'auto' }}
                      />
                    </div>
                  ) : (
                    <KeyboardArrowUp className="text-white" />
                  )}
                </button>
              </span>
            </Grid>
          </form>
          <div className="flex items-center justify-end mt-2 min-w-fit gap-x-2">
            <p className="pt-0.5 py-0 my-0 text-[1.125rem] font-normal text-black">
              {t('Price:')}
            </p>
            <p className="text-black">{itemPrice}</p>
          </div>
          <div className="flex items-center justify-end mt-2 min-w-fit gap-x-2">
            <p className="pt-0.5 py-0 my-0 text-black">{t('Total:')}</p>
            <p className="text-[1.125rem] py-0 my-0 text-black">{subTotal}</p>
          </div>
        </div>
        {token && isCartPage && (
          <div className="relative flex items-center justify-end pt-2 mt-3 -mb-2 border-0 border-t border-solid border-commonBorder">
            <div className="max-w-fit">
              <AddToWishlist
                card
                cartItemId={cartItem?.cartItemId}
                productSku={product?.sku}
                type="Move to wishlist"
              />
            </div>
          </div>
        )}
      </div>
    </ErrorBoundary>
  );
};

export default CartItem;

export type Config = {
  option_label:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal
    | null
    | undefined;
  value_label:
    | string
    | number
    | boolean
    | ReactElement<any, string | JSXElementConstructor<any>>
    | ReactFragment
    | ReactPortal
    | null
    | undefined;
};
