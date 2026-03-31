import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Button from '@mui/material/Button';
import { CircularProgress } from '@mui/material';
import { AUTHORIZED, BRAND_HEX_CODE } from '@utils/Constants';
import useDeleteWishlistProduct, {
  useAddToWishlist,
} from '@voguish/module-customer/hooks/customer-handler';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import { useRemoveItemFromCart } from '@voguish/module-quote/hooks/cart-handler';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import { useInfo } from '@voguish/module-theme/Layout/Header/Provider/InfoProvider';
import { decode } from 'base-64';
import { useTranslation } from 'next-i18next';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
type Props = {
  productSku: string;
  card?: boolean;
  type?: string;
  detailsPage?: boolean;
  cartItemId?: string;
  view?: string | any;
};

export default function AddToWishlist({
  productSku,
  view,
  cartItemId = '',
  type,
  detailsPage = false,
  card = false,
}: Props) {
  const router = useRouter();
  const token = useToken();
  const { wishlistData: data, wishListRefetch: refetch } = useInfo();
  const { status } = useSession();
  const wishlistId = data?.customer?.wishlists[0]?.id || 0;
  const { addToWishlistHandler, loading: isLoadingAddWish } =
    useAddToWishlist(refetch);
  const { removeItemFromCartHandler, isInProcess } = useRemoveItemFromCart();
  const { handleDelete } = useDeleteWishlistProduct();
  const [add, setAdd] = useState(false);
  const [item, setItem] = useState<any>(null);
  useEffect(() => {
    const itemListed = data?.customer?.wishlists[0];
    setAdd(
      itemListed?.items_v2?.items?.find?.(
        (option: { product: { sku: string } }) =>
          option?.product?.sku === productSku
      )
        ? true
        : false
    );
    setItem(
      itemListed?.items_v2?.items?.find?.(
        (option: { id: number; product: { sku: string } }) =>
          option?.product?.sku === productSku && option.id
      )
    );
  }, [data?.customer?.wishlists, productSku]);

  const onAdd = () => {
    try {
      if (status === AUTHORIZED) {
        if (!isLoadingAddWish || !isInProcess) {
          if (!add) {
            addToWishlistHandler({
              wishlistId: wishlistId,
              items: [{ sku: productSku, quantity: 1 }],
            });
          } else {
            if (wishlistId && item?.id) {
              handleDelete(wishlistId, item?.id);
            }
          }
          cartItemId && removeItemFromCartHandler(Number(decode(cartItemId)));
          setAdd(!add);
        }
      } else {
        router.push('/customer/account/login/');
      }
    } catch (error) {
      console.error('Wishlist error : ', error);
    }
  };
  const { t } = useTranslation('common');

  useEffect(() => {
    if (status === AUTHORIZED) {
      refetch();
    }
  }, [status]);

  return (
    <ErrorBoundary>
      {!card ? (
        <ErrorBoundary>
          <Button
            aria-label="add to whishlist"
            onClick={onAdd}
            className={`z-[9] min-w-0  rounded-full flex items-center justify-center cursor-pointer px-0 w-9 h-9 absolute bg-white hover:!bg-white text-sm shadow-md
           hover:shadow-lg ${
             view === 'list'
               ? '-md:top-3 -md:right-3  md:bottom-4 md:ltr:right-28 -md:rtl:left-3 md:rtl:left-28'
               : 'top-3 rtl:left-3 ltr:right-3'
           }  group`}
          >
            {' '}
            {isLoadingAddWish || isInProcess ? (
              <CircularProgress
                size={15}
                style={{ color: BRAND_HEX_CODE, margin: 'auto' }}
              />
            ) : (
              <ErrorBoundary>
                {!add ? (
                  <FavoriteBorderIcon className="text-xl font-medium text-slate-400" />
                ) : (
                  token && <FavoriteIcon className="text-xl" />
                )}
              </ErrorBoundary>
            )}
          </Button>
        </ErrorBoundary>
      ) : !detailsPage ? (
        <ErrorBoundary>
          <span className="flex items-center justify-center w-full">
            <ButtonMui
              isLoading={isLoadingAddWish || isInProcess}
              onClick={onAdd}
              className="w-full whitespace-nowrap cursor-pointer gap-1.5 rounded-[unset] border border-transparent py-3.5 font-medium uppercase text-secondary -sm:w-full !px-5 -2xs:px-2.5"
            >
              {!add ? (
                <FavoriteBorderIcon className="text-2xl text-slate-400" />
              ) : (
                <FavoriteIcon className="text-2xl" />
              )}
              <span className="lg:inline md:inline hidden">
                {' '}
                {type ? type : t('Add To Wishlist')}{' '}
              </span>
              <span className="lg:hidden md:hidden block">
                {' '}
                {type ? type : t('Wishlist')}{' '}
              </span>
            </ButtonMui>
          </span>
        </ErrorBoundary>
      ) : (
        <ErrorBoundary>
          {detailsPage && (
            <ButtonMui
              isLoading={isLoadingAddWish || isInProcess}
              onClick={onAdd}
              className="flex !border-none hover:!bg-transparent !text-secondary cursor-pointer items-center  whitespace-nowrap gap-2.5 border-0 bg-transparent px-5 -2xs:px-2.5 py-2.5 text-base font-semibold md:px-10"
            >
              {!add ? (
                <FavoriteBorderIcon className="text-sm duration-500 text-slate-400 group-hover:md:scale-110" />
              ) : (
                <FavoriteIcon className="text-sm duration-500 group-hover:md:scale-110" />
              )}
              <span className="lg:inline md:inline hidden">
                {' '}
                {type ? type : t('Add To Wishlist')}{' '}
              </span>
              <span className="lg:hidden md:hidden block">
                {' '}
                {type ? type : t('Wishlist')}{' '}
              </span>
            </ButtonMui>
          )}
        </ErrorBoundary>
      )}
    </ErrorBoundary>
  );
}
