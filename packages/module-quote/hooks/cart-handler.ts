import { useLazyQuery, useMutation } from '@apollo/client';
import { setCart } from '@store/cart';
import {
  setOrderId,
  setShippingAddressFromCartData,
  setShippingMethod,
} from '@store/checkout';
import { useAppDispatch, useAppSelector } from '@store/hooks';
import {
  GUEST_CART,
  SELECTED_STORE,
  STORE_CONFIG,
  getKeyFromStorage,
  getLocalStorage,
  removeFromLocalStorage,
  setLocalStorage,
} from '@store/local-storage';
import { setCartOpen } from '@store/store';
import { graphqlMutate, graphqlRequest } from '@utils/Fetcher';
import { isValidArray, isValidObject } from '@utils/Helper';
import { useSession } from 'next-auth/react';

import { useCustomerMutation } from '@voguish/module-customer/hooks/useCustomerMutation';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';

import { ErrorsStatic } from '@store/types';
import { AUTHORIZED, errorCat } from '@utils/Constants';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import CART_QUERY from '@voguish/module-quote/graphql/cart/Cart.graphql';
import CustomerCartQuery from '@voguish/module-quote/graphql/cart/CustomerCart.graphql';
import AddDownloadableProductsToCart from '@voguish/module-quote/graphql/mutation/AddDownloadableProductsToCart.graphql';
import AddProductsToCart from '@voguish/module-quote/graphql/mutation/AddProductsToCart.graphql';
import AddSimpleProductsToCart from '@voguish/module-quote/graphql/mutation/AddSimpleProductsToCart.graphql';
import AddVirtualProductsToCart from '@voguish/module-quote/graphql/mutation/AddVirtualProductsToCart.graphql';
import ApplyCouponToCart from '@voguish/module-quote/graphql/mutation/ApplyCouponToCart.graphql';
import BundleAddToCart from '@voguish/module-quote/graphql/mutation/BundleAddToCart.graphql';
import ClearCustomerCart from '@voguish/module-quote/graphql/mutation/ClearCustomerCart.graphql';
import CreateEmptyCartQuery from '@voguish/module-quote/graphql/mutation/CreateEmptyCart.graphql';
import PlaceOrder from '@voguish/module-quote/graphql/mutation/PlaceOrder.graphql';
import RemoveCouponFromCart from '@voguish/module-quote/graphql/mutation/RemoveCouponFromCart.graphql';
import RemoveItemFromCart from '@voguish/module-quote/graphql/mutation/RemoveItemFromCart.graphql';
import SetBillingAddressOnCart from '@voguish/module-quote/graphql/mutation/SetBillingAddressOnCart.graphql';
import SetGuestEmailOnCart from '@voguish/module-quote/graphql/mutation/SetGuestEmailOnCart.graphql';
import SetShippingAddressesOnCart from '@voguish/module-quote/graphql/mutation/SetShippingAddressesOnCart.graphql';
import SetShippingMethodsOnCart from '@voguish/module-quote/graphql/mutation/SetShippingMethodsOnCart.graphql';
import SetShippingPaymentOnCart from '@voguish/module-quote/graphql/mutation/SetShippingPaymentOnCart.graphql';
import UpdateCartItems from '@voguish/module-quote/graphql/mutation/UpdateCartItems.graphql';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { getCookie } from 'cookies-next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Logout, RootState } from 'store';
import {
  AddBundleProduct,
  AddProductsToCartInput,
  AddProductsToCartOutput,
  AddSimpleProductsToCartInput,
  CartInterface,
  RemoveItemFromCartOutput,
  SetBillingAddressOnCartInput,
  SetBillingAddressesOnCartOutput,
  SetPaymentMethodOnCartInput,
  SetPaymentMethodOnCartOutput,
  SetShippingAddressesOnCartInput,
  SetShippingAddressesOnCartOutput,
  SetShippingMethodsOnCartInput,
  SetShippingMethodsOnCartOutput,
} from '../types';

/**
 * Creating Guest Empty Cart.
 *
 * @returns boolean
 */
export const useCreateEmptyCart = (checkout = false) => {
  const { status } = useSession();
  const [updateCart, { loading }] = useLazyQuery(CART_QUERY, {
    fetchPolicy: 'no-cache',
  });
  const [customerCart, { refetch }] = useLazyQuery(CustomerCartQuery, {
    fetchPolicy: 'no-cache',
  });

  const token = useToken();
  const dispatch = useAppDispatch();
  const quote = useAppSelector((state) => state?.cart);
  const storeCode = getCookie(SELECTED_STORE) ?? process.env.DEFAULT_STORE_CODE;

  const [createEmptyCart, { loading: newCartLoad }] = useMutation(
    CreateEmptyCartQuery,
    {
      fetchPolicy: 'no-cache',
    }
  );
  const emptyCart = () => {
    if (!!token && status === AUTHORIZED) {
      customerCart({
        context: {
          headers: {
            Authorization: `Bearer ${token ?? ''}`,
            Store: storeCode,
          },
        },
      })
        .then((res) => {
          const data = res?.data?.customerCart;
          isValidObject(data) &&
            data?.cart &&
            data.cart.id &&
            dispatch(setCart({ ...data }));
        })
        // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/no-empty-function
        .catch((error) => {
          if (
            error.graphQLErrors?.some(
              (err: {
                extensions: { category: string };
                message: string | string[];
              }) =>
                errorCat.includes(err.extensions?.category) ||
                err.message.includes(
                  'The current user cannot perform operations on cart'
                )
            )
          ) {
            Logout();
          } else if (error.message.includes("The cart isn't active.")) {
            refetch().then((res) => {
              const data = res?.data?.customerCart;
              isValidObject(data) &&
                data?.cart &&
                data.cart.id &&
                dispatch(setCart({ ...data }));
            });
          }
        });
    } else if (
      !newCartLoad &&
      (!isValidArray(quote?.quote?.items) || checkout)
    ) {
      createEmptyCart().then((res) => {
        if (res?.data?.createEmptyCart) {
          updateCart({
            variables: { cartId: res?.data?.createEmptyCart || '' },
          }).then((res) => {
            const data = res?.data?.cart;
            isValidObject(data) &&
              data &&
              data.id &&
              dispatch(setCart({ ...data, isGuest: true }));
          });
          const newCartData = {
            id: res?.data?.createEmptyCart,
            isGuest: true,
          };
          setLocalStorage(GUEST_CART, JSON.stringify(newCartData));
        }
      });
    } else {
      updateCart({
        variables: { cart_id: quote?.id || '' },
      }).then((res) => {
        const data = res?.data?.cart;
        isValidObject(data) &&
          data &&
          data.id &&
          dispatch(setCart({ ...data, isGuest: true }));
      });
    }
  };
  return emptyCart;
};

/**
 * Customer Cart
 *! if Customer does not have any Cart it will create one and return the Details
 * * If Customer has cart it will fetch the data.
 *
 * @param {String} token
 * @returns
 */
export const useCustomerCart = () => {
  /**
   * To Dispatch the state for Redux
   */
  const dispatch = useAppDispatch();
  const { data, error, refetch } = useCustomerQuery(CustomerCartQuery, {
    fetchPolicy: 'no-cache',
  });
  useEffect(() => {
    if (
      data &&
      typeof data !== 'undefined' &&
      data.customerCart &&
      data.customerCart.id
    ) {
      dispatch(setCart({ ...data.customerCart, isGuest: false }));
    }

    if (
      error?.graphQLErrors?.some(
        (err) =>
          errorCat.includes(err.extensions?.category as string) ||
          err.message.includes(
            'The current user cannot perform operations on cart'
          )
      )
    ) {
      Logout();
    } else if (
      error?.graphQLErrors?.some((err) =>
        err.message.includes("The cart isn't active.")
      )
    ) {
      refetch().then((res) => {
        const data = res?.data?.customerCart;
        isValidObject(data) &&
          data?.cart &&
          data.cart.id &&
          dispatch(setCart({ ...data }));
      });
    }
  }, [data, dispatch, error]);
};
/**
 * Use Add To Cart
 * @returns
 */
export const useAddToCart = () => {
  const userData = useToken();
  const token = userData || null;
  const dispatch = useAppDispatch();
  const cartId = useSelector((state: RootState) => state?.cart?.id);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const emptyCart = useCreateEmptyCart();
  const [addToCart, { loading: isInProcess }] =
    useCustomerMutation<AddProductsToCartOutput>(AddProductsToCart);
  const doAddToCart = (cartData: AddProductsToCartInput) => {
    try {
      addToCart({
        variables: {
          cartItems: [cartData],
          cartId: cartId,
        },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data.addProductsToCart) {
            const {
              addProductsToCart: { user_errors = [], cart = null },
            } = data;
            if (isValidArray(user_errors)) {
              showToast({
                message: user_errors?.[0]?.message,
                type: 'error',
              });
              return;
            }

            if (isValidObject(cart) && cart?.id) {
              showToast({
                message: t('Product added to cart successfully!'),
                type: 'success',
              });
              dispatch(setCart({ ...cart, isGuest: token ? false : true }));
              dispatch(setCartOpen(true));
            }
          }
        })
        .catch((error: ErrorsStatic) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            } else if (gqlError.message.includes("The cart isn't active.")) {
              emptyCart();
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { doAddToCart, isInProcess };
};
export const useAddSimpleProductsToCart = () => {
  const userData = useToken();
  const token = userData || null;
  const dispatch = useAppDispatch();
  const cart_id = useSelector((state: RootState) => state?.cart?.id);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const emptyCart = useCreateEmptyCart();
  const [addSimpleProductsToCart, { loading: isInProcess, error }] =
    useCustomerMutation<AddProductsToCartOutput>(AddSimpleProductsToCart);
  const doAddToCart = (cartData: AddSimpleProductsToCartInput[]) => {
    try {
      addSimpleProductsToCart({
        variables: {
          input: { cart_items: cartData, cart_id: cart_id },
        },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data.addSimpleProductsToCart) {
            const {
              addSimpleProductsToCart: { user_errors = [], cart = null },
            } = data;
            if (isValidArray(user_errors)) {
              showToast({
                message:
                  data?.addSimpleProductsToCart?.user_errors?.[0]?.message,
                type: 'error',
              });
              return;
            }

            if (isValidObject(cart) && cart?.id) {
              showToast({
                message: t('Product added to cart successfully!'),
                type: 'success',
              });
              dispatch(setCart({ ...cart, isGuest: token ? false : true }));
              dispatch(setCartOpen(true));
            }
          }
        })
        .catch((error: any) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : Array.isArray(error.cause)
              ? error.cause
              : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            } else if (gqlError.message.includes("The cart isn't active.")) {
              emptyCart();
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.cause?.[0]?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.cause?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { doAddToCart, isInProcess, error };
};
export const useDownloadableProductsAddtoCart = () => {
  const userData = useToken();
  const token = userData || null;
  const dispatch = useAppDispatch();
  const cart_id = useSelector((state: RootState) => state?.cart?.id);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const [addDownloadableProductsToCart, { loading: isInProcess }] =
    useCustomerMutation<AddProductsToCartOutput>(AddDownloadableProductsToCart);
  const doAddToCart = (cartData: AddSimpleProductsToCartInput[]) => {
    try {
      addDownloadableProductsToCart({
        variables: {
          input: { cart_items: cartData, cart_id: cart_id },
        },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data?.addDownloadableProductsToCart) {
            const {
              addDownloadableProductsToCart: { user_errors = [], cart = null },
            } = data;
            if (isValidArray(user_errors)) {
              showToast({
                message:
                  data?.addDownloadableProductsToCart?.user_errors?.[0]
                    ?.message,
                type: 'error',
              });
              return;
            }

            if (isValidObject(cart) && cart?.id) {
              showToast({
                message: t('Product added to cart successfully!'),
                type: 'success',
              });
              dispatch(setCart({ ...cart, isGuest: token ? false : true }));
              dispatch(setCartOpen(true));
            }
          }
        })
        .catch((error: any) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { doAddToCart, isInProcess };
};
export const useBundleAddToCart = () => {
  const userData = useToken();
  const token = userData || null;
  const dispatch = useAppDispatch();
  const cart_id = useSelector((state: RootState) => state?.cart?.id);
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [addToCart, { loading: isInProcess }] =
    useCustomerMutation<AddProductsToCartOutput>(BundleAddToCart);
  const doAddToCart = (cartData?: AddBundleProduct) => {
    try {
      addToCart({
        variables: {
          input: { cart_items: [cartData], cart_id: cart_id },
        },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data.addBundleProductsToCart) {
            const {
              addBundleProductsToCart: { user_errors = [], cart = null },
            } = data;
            if (isValidArray(user_errors)) {
              showToast({
                message:
                  data?.addBundleProductsToCart?.user_errors?.[0]?.message,
                type: 'error',
              });
              return;
            }
            if (isValidObject(cart) && cart?.id) {
              showToast({
                message: t('Product added to cart successfully!'),
                type: 'success',
              });
              dispatch(setCart({ ...cart, isGuest: token ? false : true }));
              dispatch(setCartOpen(true));
            }
          }
        })
        .catch((error: any) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { doAddToCart, isInProcess };
};
export const useVirtualAddToCart = () => {
  const userData = useToken();
  const token = userData || null;
  const dispatch = useAppDispatch();
  const cart_id = useSelector((state: RootState) => state?.cart?.id);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const [addVirtualProductsToCart, { loading: isInProcess }] =
    useCustomerMutation<AddProductsToCartOutput>(AddVirtualProductsToCart);
  const doAddToCart = (cartData?: AddBundleProduct) => {
    try {
      addVirtualProductsToCart({
        variables: {
          input: { cart_items: [cartData], cart_id: cart_id },
        },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data.addVirtualProductsToCart) {
            const {
              addVirtualProductsToCart: { user_errors = [], cart = null },
            } = data;
            if (isValidArray(user_errors)) {
              showToast({
                message:
                  data?.addVirtualProductsToCart?.user_errors?.[0]?.message,
                type: 'error',
              });
              return;
            }

            if (isValidObject(cart) && cart?.id) {
              showToast({
                message: t('Product added to cart successfully!'),
                type: 'success',
              });
              dispatch(setCart({ ...cart, isGuest: token ? false : true }));
              dispatch(setCartOpen(true));
            }
          }
        })
        .catch((error: any) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { doAddToCart, isInProcess };
};
/**
 * Remove Item from cart handler.
 * @returns {CallBackFunction, boolean}
 */
export const useRemoveItemFromCart = () => {
  const dispatch = useAppDispatch();
  const token = useToken();
  const cartId = useSelector((state: RootState) => state?.cart?.id);
  const [removeItemFromCart, { loading: isInProcess }] =
    useCustomerMutation<RemoveItemFromCartOutput>(RemoveItemFromCart);
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const removeItemFromCartHandler = (cartItemId: string | number) => {
    try {
      removeItemFromCart({
        variables: { cartItemId: cartItemId, cartId: cartId },
      })
        .then((res) => {
          const data = res?.data;
          if (data && data.removeItemFromCart) {
            const cart = data.removeItemFromCart.cart;
            if (isValidObject(cart) && cart?.id) {
              dispatch(setCart({ ...cart, isGuest: !token }));
              showToast({
                message: t('Item remove from cart successfully!'),
                type: 'success',
              });
            }
          }
          if (data && data.errors) {
            showToast({
              message: data.errors
                .map(
                  (error: { message: string }) =>
                    `${error?.message || JSON.stringify(error)}`
                )
                .join('\n'),
              type: 'error',
            });
          }
        })
        .catch((error: any) => {
          // GraphQL errors come in here
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];

          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              return;
            }
          }
          showToast({
            message:
              error?.graphQLErrors?.[0]?.message ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
            type: 'error',
          });
        });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { removeItemFromCartHandler, isInProcess };
};
/**
 * Update Items in cart handler.
 * @returns {CallBackFunction, boolean}
 *
 */
export const useUpdateCartItems = () => {
  const dispatch = useAppDispatch();
  const token = useToken() || null;
  const cartId = useSelector<RootState>(
    (state: { cart: { id: string } }) => state?.cart?.id
  );
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [updateCartItems, { loading: isInProcess }] =
    useCustomerMutation(UpdateCartItems);
  /**
   * Do add to cart callback function.
   * @param {Array} cartItems - Cart Items to be updated
   */
  const updateCartItemsHandler = (
    cartItems: { cartItemId?: string | number } | any
  ) => {
    if (typeof cartItems.cartItemId === 'string')
      cartItems.cartItemId = parseInt(cartItems.cartItemId);
    return new Promise((resolve, reject) => {
      try {
        updateCartItems({
          variables: { cartItems: cartItems, cartId: cartId },
        })
          .then((res) => {
            if (res?.data === undefined && res.errors) {
              throw res;
            } else if (res?.errors && res?.errors?.length > 0) {
              throw res;
            }

            const data = res?.data?.updateCartItems?.cart;
            if (isValidObject(data) && data && data.id) {
              dispatch(
                setCart({
                  ...data,
                  isGuest: token ? false : true,
                })
              );
              showToast({
                message: t('Item updated successfully!'),
                type: 'success',
              });
              resolve(data);
            } else {
              resolve(null);
            }
          })
          .catch((error: any) => {
            // GraphQL errors come in here
            const gqlErrs = Array.isArray(error.graphQLErrors)
              ? error.graphQLErrors
              : [];

            for (const gqlError of gqlErrs) {
              const category = gqlError.extensions?.category ?? null;
              if (errorCat.includes(category)) {
                Logout();
                return;
              }
            }
            let errorMessage =
              error?.graphQLErrors?.[0]?.message ||
              (Array.isArray(error?.errors) ? error?.errors?.[0]?.message : error?.errors?.message) ||
              error?.networkError?.message ||
              error?.message ||
              (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED');

            if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('the requested qty is not available')) {
              errorMessage = t('Qty not available');
            }
            showToast({
              message: errorMessage,
              type: 'error',
            });
            reject(error);
          });
      } catch (err: any) {
        let errorMessage =
          err?.graphQLErrors?.[0]?.message ||
          (Array.isArray(err?.errors) ? err?.errors?.[0]?.message : err?.errors?.message) ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED');

        if (typeof errorMessage === 'string' && errorMessage.toLowerCase().includes('the requested qty is not available')) {
          errorMessage = t('Qty not available');
        }
        showToast({
          message: errorMessage,
          type: 'error',
        });
        reject(err);
      }
    });
  };

  return { updateCartItemsHandler, isInProcess };
};

/**
 * Clear cart handler.
 * @returns {CallBackFunction, boolean}
 */
export const useClearCart = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [isInProcess, setIsInProcess] = useState(false);
  const token = useToken() || null;
  const cartId = useSelector<RootState>(
    (state: { cart: { id: string } }) => state?.cart?.id
  );
  const [clearCart, { data, loading, error }] =
    useCustomerMutation(ClearCustomerCart);
  useEffect(() => {
    setIsInProcess(loading);
    if (data && data.clearCustomerCart) {
      dispatch(
        setCart({
          ...data.clearCustomerCart,
          isGuest: token ? false : true,
        })
      );
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   *
   * /**
   * Do clear cart callback function.
   */
  const clearCartHandler = async () => {
    try {
      const { data } = await clearCart({
        variables: { cartId: cartId },
      });
      if (data && data.clearCustomerCart) {
        dispatch(
          setCart({
            ...data.clearCustomerCart,
            isGuest: token ? false : true,
          })
        );
        showToast({ message: t('Cart clear successfully!'), type: 'success' });
      }
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { clearCartHandler, isInProcess };
};

/**
 * Fetch cart
 * @param {String} cartId
 * @param {Function} callback
 */
export const fetchCartData = async (
  cartId: string,
  callback: Function,
  token?: string
) => {
  const storeCode =
    getKeyFromStorage(STORE_CONFIG, 'store_code') ??
    getCookie(SELECTED_STORE) ??
    process.env.DEFAULT_STORE_CODE;

  const data = await graphqlRequest({
    query: CART_QUERY,
    variables: { cartId: cartId },
    options: {
      context: {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          Store: storeCode,
        },
      },
    },
  });
  if (isValidObject(data) && data.cart && data.cart.id) {
    callback(data.cart);
  }
};

/**
 * Set Guest Email Address hook
 *
 * {CallBackFunction, boolean}
 */
export const useSetGuestEmailOnCart = (
  cartId: string,
  handleNext: () => void
) => {
  const dispatch = useAppDispatch();
  const [setGuestEmail, { loading: isInProcess }] =
    useMutation(SetGuestEmailOnCart);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  /**
   * Do set guest email address callback function.
   * @param {String|null} email - Guest Email Address.
   */
  const setGuestEmailHandler = async (email: string) => {
    setGuestEmail({
      variables: {
        cartId: cartId,
        email: email,
      },
    })
      .then((res) => {
        const cartData = res?.data?.setGuestEmailOnCart?.cart || null;
        if (isValidObject(cartData) && cartData?.id) {
          dispatch(setCart({ ...cartData, isGuest: true }));
          showToast({ message: t('Email address updated successfully!') });
          handleNext();
        }
      })
      .catch((err: any) => {
        showToast({
          message:
            err?.graphQLErrors?.[0]?.message ||
            err?.networkError?.message ||
            err?.message ||
            (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
          type: 'error',
        });
      });
  };

  return { setGuestEmailHandler, isInProcess };
};

/**
 * Set Shipping Address hook
 *
 * {CallBackFunction, boolean}
 */
export const useSetShippingAddressOnCart = (handleNext: () => void) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();

  const token = useToken() || null;
  const [isInProcess, setIsInProcess] = useState(false);
  const [addressInput, setAddressInput] = useState<any>();
  const [setShippingAddress, { data, loading, error }] =
    useCustomerMutation<SetShippingAddressesOnCartOutput>(
      SetShippingAddressesOnCart
    );
  const { t } = useTranslation('common');

  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.setShippingAddressesOnCart?.cart || null;
    if (cartData) {
      if (!addressInput?.shippingAddresses?.[0]?.customer_address_id) {
        setLocalStorage('UserAddressUse', {
          token: token,
          IsUseShippingAddressForm: true,
        });
      }
      if (addressInput?.shippingAddresses?.[0]?.customer_address_id) {
        //  return;
        console.log('');
        // addressInput?.shippingAddresses?.[0]?.customer_address_id;
      } else {
        cartData.shipping_addresses[0].uid = -1;
      }
      isValidObject(cartData) &&
        cartData &&
        cartData.id &&
        dispatch(setCart({ ...cartData, isGuest: token ? false : true }));
      dispatch(setShippingAddressFromCartData(cartData));
      showToast({ message: t('Shipping Address updated successfully!') });
      handleNext();
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do set shipping address callback function.
   * @param {SetShippingAddressesOnCartInput} addressInput - Shipping Address
   */
  const setShippingAddressHandler = async (
    addressInput: SetShippingAddressesOnCartInput
  ) => {
    setAddressInput(addressInput);
    await setShippingAddress({ variables: addressInput });
  };

  return { setShippingAddressHandler, isInProcess };
};

/**
 * Set Billing Address hook
 *
 * {CallBackFunction, boolean}
 */
export const useSetBillingAddressOnCart = (handleNext: () => void) => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const dispatch = useAppDispatch();
  const token = useToken() || null;
  const [isInProcess, setIsInProcess] = useState(false);
  const [setBillingAddress, { data, loading, error }] =
    useCustomerMutation<SetBillingAddressesOnCartOutput>(
      SetBillingAddressOnCart
    );
  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.setBillingAddressOnCart?.cart || null;
    if (cartData) {
      isValidObject(cartData) &&
        cartData &&
        cartData.id &&
        setCart({ ...cartData, isGuest: token ? false : true });
      showToast({ message: t('Billing Address updated successfully!') });
      handleNext();
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do set billing address callback function.
   */
  const setBillingAddressHandler = async (
    input: SetBillingAddressOnCartInput
  ) => {
    try {
      await setBillingAddress({
        variables: input,
      });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { setBillingAddressHandler, isInProcess };
};

/**
 * Set Shipping Method hook
 *
 * {CallBackFunction, boolean}
 */
export const useSetShippingMethodOnCart = (handleNext: () => void) => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const token = useToken() || null;
  const [isInProcess, setIsInProcess] = useState(false);
  const [setShippingMethodHandler, { data, loading, error }] =
    useCustomerMutation<SetShippingMethodsOnCartOutput>(
      SetShippingMethodsOnCart
    );
  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.setShippingMethodsOnCart?.cart || null;
    if (isValidObject(cartData) && cartData && cartData.id) {
      dispatch(setCart({ ...cartData, isGuest: token ? false : true }));
      dispatch(setShippingMethod(cartData));
      showToast({ message: t('Shipping method updated successfully!') });
      handleNext();
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do set shipping address callback function.
   * @param {SetShippingAddressesOnCartInput} addressInput - Shipping Address
   */
  const setShippingMethodsHandler = async (
    input: SetShippingMethodsOnCartInput
  ) => {
    await setShippingMethodHandler({ variables: input });
  };

  return { setShippingMethodsHandler, isInProcess };
};

/**
 * Set Shipping Method hook
 *
 * {CallBackFunction, boolean}
 */
export const useSetPaymentMethodOnCart = (handleNext?: () => void) => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const dispatch = useAppDispatch();
  const token = useToken() || null;
  const [isInProcess, setIsInProcess] = useState(false);
  const [setPaymentMethodHandler, { data, loading, error }] =
    useCustomerMutation<SetPaymentMethodOnCartOutput>(SetShippingPaymentOnCart);
  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.setPaymentMethodOnCart?.cart || null;
    if (isValidObject(cartData) && cartData && cartData.id) {
      dispatch(setCart({ ...cartData, isGuest: token ? false : true }));
      showToast({ message: t('Payment method updated successfully!') });
      if (typeof handleNext === 'function') {
        handleNext();
      }
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do set Payment address callback function.
   * @param {SetPaymentAddressesOnCartInput} addressInput - Payment Address
   */
  const setPaymentMethodsHandler = async (
    input: SetPaymentMethodOnCartInput
  ) => {
    await setPaymentMethodHandler({ variables: input });
  };

  return { setPaymentMethodsHandler, setPaymentMethodHandler, isInProcess };
};

/**
 * Coupon applier
 * @returns {CallBackFunction, boolean}
 */
export const useApplyCoupon = () => {
  const dispatch = useAppDispatch();
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [isInProcess, setIsInProcess] = useState(false);
  const token = useToken() || null;
  const cartId = useSelector<RootState>(
    (state: { cart: { id: string } }) => state?.cart?.id
  );
  const [applyCoupon, { data, loading, error }] =
    useCustomerMutation(ApplyCouponToCart);
  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.applyCouponToCart?.cart || null;
    if (isValidObject(cartData) && cartData && cartData.id) {
      dispatch(setCart({ ...cartData, isGuest: token ? false : true }));
      showToast({
        message: t('Coupon applied successfully!'),
        type: 'success',
      });
    }
    if (error) {
      console.error(
        error?.graphQLErrors?.[0]?.message ||
        error?.networkError?.message ||
        error?.message ||
        (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED')
      );
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do apply coupon callback function.
   * @param {String} couponCode - Coupon code
   */
  const applyCouponHandler = (
    couponCode: string,
    callback: (error: any) => void
  ) => {
    applyCoupon({
      variables: { couponCode: couponCode, cartId: cartId },
    })
      .then((response) => {
        const error: any = response?.errors;
        callback(
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED')
        );
      })
      .catch((error) => {
        callback(
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED')
        );
      });
  };

  return { applyCouponHandler, isInProcess };
};

/**
 * Place Order handler
 */
export const usePlaceOrder = () => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const [isInProcess, setIsInProcess] = useState(false);
  const router = useRouter();
  const [placeOrder] = useCustomerMutation(PlaceOrder);
  const token = useToken();
  const dispatch = useAppDispatch();

  const placeOrderHandler = (
    cartId: string,
    callback?: (any?: any) => void
  ) => {
    setIsInProcess(true);

    placeOrder({
      variables: {
        cartId,
      },
    })
      .then((res: any) => {
        const orderNumber = res?.data.placeOrder.order.order_number;
        dispatch(setOrderId(orderNumber));
        if (typeof callback === 'function') {
          callback(() => {
            router.push(`/checkout/${orderNumber}`);
            removeFromLocalStorage('UserAddressUse');
          });
        } else {
          router.push(`/checkout/${orderNumber}`);
          removeFromLocalStorage('UserAddressUse');
        }
        setIsInProcess(false);
        showToast({ message: t('Order Placed successfully!') });
      })
      .catch((err: any) => {
        if (typeof callback === 'function') {
          callback();
        }
        setIsInProcess(false);
        showToast({
          message:
            err?.graphQLErrors?.[0]?.message ||
            err?.networkError?.message ||
            err?.message ||
            (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
          type: 'error',
        });
      });
  };
  return { placeOrderHandler, isInProcess };
};

/**
 * Remove coupon from cart.
 *
 * @returns {CallBackFunction, boolean}
 */
export const useRemoveCouponFromCart = () => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const dispatch = useAppDispatch();
  const token = useToken() || null;
  const [isInProcess, setIsInProcess] = useState(false);
  const cartId = useSelector<RootState>(
    (state: { cart: { id: string } }) => state?.cart?.id
  );
  const [removeCoupon, { data, loading, error }] =
    useCustomerMutation(RemoveCouponFromCart);
  useEffect(() => {
    setIsInProcess(loading);
    const cartData = data?.removeCouponFromCart?.cart || null;
    if (isValidObject(cartData) && cartData && cartData.id) {
      dispatch(setCart({ ...cartData, isGuest: token ? false : true }));
    }
    if (error) {
      showToast({
        message:
          error?.graphQLErrors?.[0]?.message ||
          error?.networkError?.message ||
          error?.message ||
          (typeof error === 'string' ? error : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, error, dispatch, token]);

  /**
   * Do remove coupon callback function.
   * @param {String} couponCode - Coupon code
   */
  const removeCouponHandler = () => {
    try {
      removeCoupon({
        variables: { cartId: cartId },
      });
      showToast({ message: t('Coupon removed from cart!'), type: 'success' });
    } catch (err: any) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  };

  return { removeCouponHandler, isInProcess };
};

export const createEmptyCart = async (
  token: string | null,
  callback: (cartData: CartInterface) => void // eslint-disable-line
) => {
  if (token && token !== '') {
    createCustomerCart(token, callback);
  } else {
    createGuestCart(callback);
  }
};

const createGuestCart = async (
  callback: (cartData: CartInterface) => void // eslint-disable-line
) => {
  const storeCode = getCookie(SELECTED_STORE);
  const locale = getLocalStorage('current_store');

  const data = await graphqlMutate({
    mutation: CreateEmptyCartQuery,
    options: {
      Store: storeCode || locale,
    },
  });

  if (data && data.createEmptyCart) {
    fetchCartData(data.createEmptyCart, callback);
  }
};

const createCustomerCart = async (
  token: string | null,
  callback: (cartData: CartInterface) => void // eslint-disable-line
) => {
  const storeCode = getCookie(SELECTED_STORE);
  const defaultStore = getKeyFromStorage(STORE_CONFIG, 'store_code');
  const locale = getLocalStorage('current_store') || defaultStore || storeCode;

  const customerData = await graphqlRequest({
    query: CustomerCartQuery,
    options: {
      context: {
        headers: {
          Authorization: `Bearer ${token}`,
          Store: locale,
        },
      },
    },
  });

  if (customerData && customerData.customerCart) {
    callback(customerData.customerCart);
  } else if (customerData.errors && customerData.errors.length > 0) {
    const error = customerData.errors[0];
    if (error.extensions?.category === 'graphql-authorization') {
      Logout();
    }
  }
};