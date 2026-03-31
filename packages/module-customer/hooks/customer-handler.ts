import { useQuery } from '@apollo/client';
import { Logout } from 'store';
import { COUNTRIES, setLocalStorage } from '@store/local-storage';
import { errorCat } from '@utils/Constants';
import { isValidArray } from '@utils/Helper';
import GET_COUNTERIES from '@voguish/module-customer/graphql/GetCountries.graphql';
import AddProductsToWishlist from '@voguish/module-customer/graphql/mutation/AddProductsToWhishlist.graphql';
import REMOVE_WISHLIST_PRODUCT from '@voguish/module-customer/graphql/mutation/RemoveProductsFromWishlist.graphql';
import { CountriesQueryResult } from '@voguish/module-store';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useCustomerMutation } from './useCustomerMutation';
import { useToken } from './useToken';

interface AddToWishListReturnType {
  addToWishlistHandler: ({
    wishlistId,
    items,
  }: {
    wishlistId: string;
    items: [] | any;
  }) => void;
  loading: boolean;
}

/**
 * Use add to cart handler.
 *! It will return a callback function
 *
 * @returns {AddToWishListReturnType} - {sku, qty}
 */
export const useAddToWishlist = (refetch: any): AddToWishListReturnType => {
  const { showToast } = useToast();
  const { t } = useTranslation('common');

  const userData = useToken();
  const token = userData || null;
  const [addToWishlist, { data, loading, error }] = useCustomerMutation(
    AddProductsToWishlist
  );
  const route = useRouter();
  useEffect(() => {
    if (data && data?.addProductsToWishlist) {
      showToast({ message: t('Product added to wishlist.'), type: 'success' });
      refetch();
    }
  }, [data, refetch]);

  if (error) {
    showToast({
      message:
        error?.graphQLErrors?.[0]?.message ||
        error?.networkError?.message ||
        (typeof error?.message === 'string'
          ? error.message
          : 'UNEXPECTED ERROR OCCURRED'),
      type: 'error',
    });
  }

  const addToWishlistHandler = ({
    wishlistId,
    items,
  }: {
    wishlistId: string;
    items: [];
  }) => {
    try {
      if (!token) {
        showToast({ message: t('You need to log in first.'), type: 'error' });
        route.push('/customer/account/login');
        return false;
      }
      addToWishlist({
        variables: { id: wishlistId, items: items },
      })
        .then(() => {})
        .catch((error) => {
          const gqlErrs = Array.isArray(error.graphQLErrors)
            ? error.graphQLErrors
            : [];
          for (const gqlError of gqlErrs) {
            const category = gqlError.extensions?.category ?? null;
            if (errorCat.includes(category)) {
              Logout();
              showToast({
                message: t('You need to log in first.'),
                type: 'error',
              });
              return;
            }
          }
        });
    } catch (error) {
      showToast({ message: t('Try again!'), type: 'error' });
    }
  };

  return { addToWishlistHandler, loading };
};

export const useSetAddressCountries = () => {
  const {
    data,
    loading,
    error: err,
  } = useQuery<CountriesQueryResult>(GET_COUNTERIES);
  const { showToast } = useToast();

  useEffect(() => {
    const countryObj = data?.countries || [];
    if (isValidArray(countryObj)) {
      setLocalStorage(COUNTRIES, countryObj);
    }
    if (err) {
      showToast({
        message:
          err?.graphQLErrors?.[0]?.message ||
          err?.networkError?.message ||
          err?.message ||
          (typeof err === 'string' ? err : 'UNEXPECTED ERROR OCCURRED'),
        type: 'error',
      });
    }
  }, [data, loading, err]);
};

const useDeleteWishlistProduct = () => {
  const userData = useToken();
  const route = useRouter();

  const token = userData || null;
  const [removeItemFromWishlist, { loading, error, data }] =
    useCustomerMutation(REMOVE_WISHLIST_PRODUCT);
  const { showToast } = useToast();
  const { t } = useTranslation('common');
  const handleDelete = (wishlistId: number, wishlist_product_id: number) => {
    try {
      if (!token) {
        showToast({ message: t('You need to log in first.'), type: 'error' });
        route.push('/customer/account/login');
        return false;
      }
      removeItemFromWishlist({
        variables: { id: wishlistId, wishlistItemsIds: wishlist_product_id },
      })
        .then(() => {
          showToast({
            type: 'success',
            message: t('Wishlist Product deleted successfully'),
          });
        })
        .catch((err) => {
          // Show error message
          showToast({
            message:
              (err?.graphQLErrors[0]?.message || err?.message || err) ??
              'UNEXPECTED ERROR OCCURRED',
            type: 'error',
          });
        });
    } catch (error) {
      showToast({ message: t('Try again!'), type: 'error' });
    }
  };

  return { handleDelete, loading, error, data };
};

export default useDeleteWishlistProduct;
