import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import { getFormattedPrice, isValidArray, isValidObject } from '@utils/Helper';
import { NoWishlistItem } from '@voguish/module-customer/Components/WishlistTab/NoWishlistItem';
import { WishlistPlaceholder } from '@voguish/module-customer/Components/WishlistTab/WishlistPlaceholder';
import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';
import { HTMLRenderer } from '@voguish/module-theme/components/HTMLRenderer';
import { useState } from 'react';

import { RootState } from '@store';
import { setCart } from '@store/cart';
import { getLocalStorage, SELECTED_STORE } from '@store/local-storage';
import { graphqlRequest } from '@utils/Fetcher';
import Thumbnail from '@voguish/module-catalog/Components/Product/Item/Thumbnail';
import GET_WISHLIST from '@voguish/module-customer/graphql/Wishlist.graphql';
import ADD_WISHLIST_PRODUCT from '@voguish/module-customer/graphql/mutation/AddWishlistItemsToCart.graphql';
import UPDATE_WISHLIST_ITEM from '@voguish/module-customer/graphql/mutation/UpdateProductsInWishlist.graphql';
import useDeleteWishlistProduct from '@voguish/module-customer/hooks/customer-handler';
import CART_QUERY from '@voguish/module-quote/graphql/cart/Cart.graphql';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { getCookie } from 'cookies-next';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import Sidebar from '../Layout/Sidebar';
import { CircularProgress } from '@mui/material';
import { BRAND_HEX_CODE } from '@utils/Constants';
import { AddCartWhish } from '@packages/module-theme/components/elements/Icon';
import { WhishlistDown as WishListDown } from '@packages/module-theme/components/elements/Icon';
import { TrashIcon } from '@packages/module-theme/components/elements/Icon';
/**
 * It function to return price with valid currency
 * @param wishlist_item
 * @returns
 */
const commonStyles = {
  bgcolor: 'background.paper',
  mt: 1,
  mb: 2,
  border: 1,
  borderRadius: 1,
  borderColor: 'themeAdditional.borderColor',
};
interface WishlistDataType {
  price_range: {
    minimum_price: {
      regular_price: {
        value: number;
        currency: string;
      };
    };
  };
}

const getFormattedPriceValue = (wishlist_item: WishlistDataType) => {
  const wishListItemvalue =
    wishlist_item?.price_range?.minimum_price?.regular_price?.value;
  const wishListCurrency =
    wishlist_item?.price_range?.minimum_price?.regular_price?.currency;
  return getFormattedPrice(wishListItemvalue, wishListCurrency);
};
interface WishlistItemDataType {
  product: {
    thumbnail: {
      url: string;
    };
    name: string;
    url_key: string;
    price_range: {
      minimum_price: {
        regular_price: {
          value: number;
          currency: string;
        };
      };
    };
  };
  id: number;
  quantity: number;
  __typename: string;
  description: string;
}

const Wishlist = () => {
  const [deletionId, setDeletionId] = useState<number>(0);
  const [itemId, setItemId] = useState<number>(0);
  const { data, loading, refetch /*, error */ } = useCustomerQuery(
    GET_WISHLIST,
    {
      variables: { currentPage: 1, pageSize: 9 },
    }
  );

  const wishlistProducts = data?.customer?.wishlists[0]?.items_v2?.items;
  const wishlistId = data?.customer?.wishlists[0]?.id || 0;
  const id = data?.customer?.wishlists[0]?.id;
  const { t } = useTranslation('common');

  const { register } = useForm();

  /**
   * Remove Item from Wishlist
   */
  const { handleDelete, loading: isDeletionWishLoading } =
    useDeleteWishlistProduct();
  /**
   * Add to cart wishlist product
   */
  const { showToast } = useToast();
  const token = useSession();
  const cartId = useSelector((state: RootState) => state?.cart?.id);
  const dispatch = useDispatch();
  const locale = getLocalStorage('current_store');

  const [addWishlistItemToCart, { loading: isAddCardWishLoading }] =
    useCustomerMutation(ADD_WISHLIST_PRODUCT);
  const handleAddToCart = (wishlistId: number, wishlist_product_id: number) => {
    addWishlistItemToCart({
      variables: { id: wishlistId, itemIds: [wishlist_product_id] },
    })
      .then(async () => {
        showToast({
          type: 'success',
          message: 'Add to cart successfully',
        });
        const storeCode = getCookie(SELECTED_STORE);
        const userToken = token?.data?.user?.token;
        const data = await graphqlRequest({
          query: CART_QUERY,
          variables: { cartId: cartId },
          options: {
            fetchPolicy: 'no-cache',
            context: {
              headers: {
                Authorization: userToken ? `Bearer ${userToken}` : '',
                Store: storeCode || locale || 'en',
              },
            },
          },
        });
        if (isValidObject(data) && data?.cart && data.cart.id) {
          dispatch(setCart({ ...data?.cart, isGuest: true }));
        }
        refetch();
      })
      .catch((err) => {
        showToast({
          message:
            (err?.graphQLErrors[0]?.message || err?.message || err) ??
            'UNEXPECTED ERROR OCCURRED',
          type: 'error',
        });
      });
  };
  const deleteWishItemHandler = (id: number, wishListId: number) => {
    setDeletionId(wishListId);
    handleDelete(id, wishListId);
    setDeletionId(wishListId);
  };

  const addItemHandler = (id: number, wishListId: number) => {
    if (!isAddCardWishLoading) {
      setItemId(wishListId);
      handleAddToCart(id, wishListId);
      setItemId(wishListId);
    }
  };
  /**
   * Update wishlist
   */
  const [commentOpen, setCommentOpen] = useState(0);
  const [updateWishListProduct] = useCustomerMutation(UPDATE_WISHLIST_ITEM);
  refetch({ currentPage: 1, pageSize: 9 });
  return (
    <Sidebar>
      <ErrorBoundary>
        <Box sx={{ ml: { md: '8px', xl: '8px', lg: '8px', xs: 0 } }}>
          <Grid
            container
            sx={{ px: 2, py: 2, ...commonStyles }}
            justifyContent="space-between"
            alignItems="center"
          >
            <Grid item>
              <Typography
                variant="h4"
                className="text-lg font-semibold uppercase"
              >
                {' '}
                {t('Wishlist')}
              </Typography>
            </Grid>
            <Grid item></Grid>
          </Grid>
          {loading ? (
            <WishlistPlaceholder />
          ) : (
            <Grid
              container
              direction="row"
              justifyContent="flex-start"
              spacing={2}
              sx={{ my: 1 }}
            >
              {isValidArray(wishlistProducts) ? (
                wishlistProducts?.map(
                  (wishlist_item: WishlistItemDataType, index: number) => (
                    <ErrorBoundary key={index}>
                      <Grid item lg={3} md={4} sm={4} xs={12}>
                        <Box
                          component="div"
                          className="border border-solid rounded border-colorBorder"
                        >
                          <Box
                            component="div"
                            className="bg-color relative min-h-[15rem] cursor-pointer border-0 border-b-[1px] border-solid border-colorBorder"
                          >
                            <Thumbnail
                              className="object-contain object-center h-full"
                              thumbnail={wishlist_item?.product?.thumbnail?.url}
                              alt={wishlist_item?.product?.name}
                              fill
                            />
                          </Box>
                          <Box
                            component="div"
                            textAlign="start"
                            className="px-2 py-1 fd-cl rounded-b-md"
                          >
                            <Typography
                              variant="body2"
                              className="font-normal Line-clamp-1"
                              sx={{ color: '#000000' }}
                              component={Link}
                              href={
                                '/catalog/product/' +
                                wishlist_item?.product?.url_key
                              }
                            >
                              <HTMLRenderer
                                htmlText={wishlist_item?.product?.name || ''}
                              ></HTMLRenderer>
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: '#000000', fontWeight: 500 }}
                            >
                              {getFormattedPriceValue(wishlist_item?.product)}
                            </Typography>
                            <Box
                              className="flex items-center justify-between shadow-[unset]"
                              component="div"
                            >
                              <div className="flex items-center justify-between w-full">
                                <div className="max-w-2/3 flex min-h-[35px] items-center gap-2">
                                  <label className="text-sm font-medium text-gray-900 text-start">
                                    {t('Qty')}
                                  </label>
                                  <input
                                    id="Quantity"
                                    type="number"
                                    {...register('qty' + wishlist_item?.id, {
                                      value: wishlist_item?.quantity || 0,
                                    })}
                                    min={1}
                                    className="h-full w-[50%] rounded border-transparent text-sm text-gray-900 outline outline-1 outline-gray-300"
                                    onBlur={(e) => {
                                      updateWishListProduct({
                                        variables: {
                                          wishlistId: wishlistId,
                                          wishlistItems: [
                                            {
                                              wishlist_item_id:
                                                wishlist_item?.id,
                                              quantity: e.target.value,
                                            },
                                          ],
                                        },
                                      });
                                    }}
                                  />
                                </div>
                                <div className="flex gap-1 cursor-pointer max-w-1/3">
                                  {wishlist_item?.__typename ===
                                  'ConfigurableWishlistItem' ? (
                                    <ErrorBoundary>
                                      <Link
                                        href={
                                          '/catalog/product/' +
                                          wishlist_item?.product?.url_key
                                        }
                                      >
                                        <AddCartWhish />
                                      </Link>
                                    </ErrorBoundary>
                                  ) : (
                                    <ErrorBoundary>
                                      {
                                        <div
                                          className="relative"
                                          onClick={() =>
                                            addItemHandler(
                                              id,
                                              wishlist_item?.id
                                            )
                                          }
                                        >
                                          {isAddCardWishLoading &&
                                            itemId === wishlist_item?.id && (
                                              <div className="absolute top-0 bottom-0 left-0 right-0 pt-1 pl-2 bg-white ">
                                                <CircularProgress
                                                  size={15}
                                                  style={{
                                                    color: BRAND_HEX_CODE,
                                                    margin: 'auto',
                                                  }}
                                                />
                                              </div>
                                            )}
                                          <AddCartWhish />
                                        </div>
                                      }
                                    </ErrorBoundary>
                                  )}
                                  <ErrorBoundary>
                                    <div
                                      className="relative"
                                      onClick={() =>
                                        deleteWishItemHandler(
                                          id,
                                          wishlist_item?.id
                                        )
                                      }
                                    >
                                      {isDeletionWishLoading &&
                                        deletionId === wishlist_item?.id && (
                                          <div className="absolute top-0 bottom-0 left-0 right-0 pt-1 pl-2 bg-white">
                                            <CircularProgress
                                              size={15}
                                              style={{
                                                color: BRAND_HEX_CODE,
                                                margin: 'auto',
                                              }}
                                            />
                                          </div>
                                        )}
                                      <TrashIcon />
                                    </div>
                                  </ErrorBoundary>
                                </div>
                              </div>
                            </Box>
                          </Box>
                          <ErrorBoundary>
                            <Grid className="w-full px-2 transition-all bg-white rounded-md border-top-none">
                              <Grid
                                onMouseLeave={() => setCommentOpen(0)}
                                className="pb-2 group"
                              >
                                <label
                                  onMouseEnter={() =>
                                    setCommentOpen(wishlist_item?.id)
                                  }
                                  htmlFor="message"
                                  className="flex items-center justify-between text-black"
                                >
                                  {' '}
                                  {t('Comments')}
                                  <WishListDown />
                                </label>
                                {commentOpen == wishlist_item?.id && (
                                  <input
                                    id="message"
                                    name="message"
                                    className="block w-full p-2 text-sm text-gray-900 transition-opacity duration-500 border-transparent rounded outline outline-1 outline-gray-300"
                                    placeholder={t('Write a comments')}
                                    defaultValue={
                                      wishlist_item?.description || ''
                                    }
                                    onMouseLeave={(e: any) => {
                                      updateWishListProduct({
                                        variables: {
                                          wishlistId: wishlistId,
                                          wishlistItems: [
                                            {
                                              wishlist_item_id:
                                                wishlist_item?.id,
                                              description: e.target.value || '',
                                            },
                                          ],
                                        },
                                      });
                                    }}
                                  />
                                )}
                              </Grid>
                            </Grid>
                          </ErrorBoundary>
                        </Box>
                      </Grid>
                    </ErrorBoundary>
                  )
                )
              ) : (
                <NoWishlistItem />
              )}
            </Grid>
          )}
        </Box>
      </ErrorBoundary>
    </Sidebar>
  );
};
export default Wishlist;
