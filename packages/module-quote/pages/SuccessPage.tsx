import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { clearCart, setCart } from '@store/cart';
import { removeOrderId } from '@store/checkout';
import { useAppDispatch } from '@store/hooks';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import { useTranslation } from 'next-i18next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { createEmptyCart } from '../hooks';
import { CartInterface } from '../types';

const CheckoutSuccessPage = ({
  order,
}: {
  order: string | number | {} | undefined;
}) => {
  const router = useRouter();
  const { t } = useTranslation('common');

  const token = useToken();

  const dispatch = useAppDispatch();
  useEffect(() => {
    const handleRouteChange = () => {
      if (
        '/checkout/success' == router.pathname ||
        '/checkout/cart' == router.pathname
      ) {
        return;
      } else {
        dispatch(removeOrderId());
      }
    };
    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.on('routeChangeStart', handleRouteChange);
    };
  }, [dispatch, router.events, router.pathname]);
  useEffect(() => {
    dispatch(clearCart());
    const afterFetchingCart = async (cartData: CartInterface) => {
      dispatch(setCart({ ...cartData, isGuest: true }));
    };
    createEmptyCart(`${token}`, afterFetchingCart);
  });

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-center h-screen text-center">
        <div className="p-4 relative -top-[10%] rounded">
          <div className="flex flex-col items-center space-y-6">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-32 h-32 text-brand"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="1"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <Typography
              variant="ErrorHeading"
              component="h1"
              className="text-4xl font-bold -xs:text-2xl"
            >
              {t('Thank You !')}
            </Typography>
            <Typography
              variant="h2"
              component="h2"
              className="font-medium -xs:text-lg"
            >
              {t('Thank you for your purchase! See You Again')}
            </Typography>
            <Typography
              variant="h3"
              className="text-xl font-medium -xs:text-lg"
            >
              {t('View your order')}{' '}
              <Link
                className="px-2 font-semibold no-underlined"
                href={`/sales/order/${order}`}
              >
                {`${order}`}
              </Link>
            </Typography>
            <Button
              variant="contained"
              className="w-full max-w-xs py-4 rounded-none shadow-none"
              onClick={() => {
                router.push('/');
                dispatch(removeOrderId());
              }}
            >
              {t('Go To Home')}
            </Button>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default CheckoutSuccessPage;
