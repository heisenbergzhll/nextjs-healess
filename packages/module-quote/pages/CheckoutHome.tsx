import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { SELECTED_STORE } from '@store/local-storage';
import { graphqlRequest } from '@utils/Fetcher';
import { isValidArray, isValidObject, parseAddress } from '@utils/Helper';
import {
  default as CustomerAddressQuery,
  default as GET_CUSTOMER_ADDRESS,
} from '@voguish/module-customer/graphql/CustomerAddress.graphql';
import { useCustomerQuery } from '@voguish/module-customer/hooks/useCustomerQuery';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import Containers from '@voguish/module-theme/components/ui/Container';
import { getCookie } from 'cookies-next';
import { getSession } from 'next-auth/react';
import dynamic from 'next/dynamic';
import Router from 'next/router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { EmptyCart } from '../Components/Cart/EmptyCart';
import { CheckoutLayout } from '../Components/Checkout';
import { CheckoutStep } from '../types';
import { CheckoutSkeleton } from '@packages/module-marketplace/Components/Placeholder';
import { useRouteTransition } from '@packages/module-compare/Hooks/useRouteTransition';
const OrderSummary = dynamic(
  () => import('@voguish/module-quote/Components/Checkout/OrderSummary')
);
const Stepper = dynamic(() => import('@mui/material/Stepper'));
const StepContent = dynamic(() => import('@mui/material/StepContent'));
const StepLabel = dynamic(() => import('@mui/material/StepLabel'));
const Step = dynamic(() => import('@mui/material/Step'));

const Email = dynamic(
  () => import('@voguish/module-quote/Components/Checkout/Email')
);
const Payment = dynamic(
  () => import('@voguish/module-quote/Components/Checkout/Payment')
);
const BillingAddress = dynamic(
  () =>
    import('@voguish/module-quote/Components/Checkout/Address/BillingAddress')
);
const ShippingAddress = dynamic(
  () =>
    import('@voguish/module-quote/Components/Checkout/Address/ShippingAddress')
);
const ShippingMethods = dynamic(
  () => import('@voguish/module-quote/Components/Checkout/ShippingMethods')
);
interface PageInterface {
  props?: any;
  req?: any;
  params?: any;
  customerAddressesData?: any;
}

const CheckoutHome = () => {
  const { t } = useTranslation('common');
  const isRedirecting = useRouteTransition();

  const [activeStep, setActiveStep] = useState(0);
  const [show, setShow] = useState(false);
  const SHowItems = () => {
    setShow(!show);
  };

  const token = useToken();

  const {
    data: customerAddress,
    refetch,
    loading,
  } = useCustomerQuery(GET_CUSTOMER_ADDRESS);

  const addresses = customerAddress?.customer?.addresses || [];
  /**
   * Fetching cart date from redux
   */
  const quote = useSelector((state: RootState) => state?.cart?.quote || null);
  if (isRedirecting) {
    return <CheckoutSkeleton />;
  }

  if (!isValidObject(quote) || !isValidArray(quote?.items)) {
    return <EmptyCart />;
  }
  /**
   * Handle Stepper Form to Next step
   */
  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  /**
   * Handle Stepper Form to Prev step
   */
  const handlePrev = () => {
    if (activeStep === 0) {
      Router.push('/checkout/cart');
    } else {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  };

  let steps: CheckoutStep[] = quote
    ? [
        {
          index: 'DETAILS',
          label: t('Personal Details'),
          content: (
            <ErrorBoundary>
              <Email
                isAccountLoggedIn={!!token}
                handleNext={handleNext}
                email={quote?.email}
                cartId={quote?.id}
                handlePrev={handlePrev}
              />
            </ErrorBoundary>
          ),
        },
        {
          label: t('Billing Address'),
          index: 'BILLING-ADDRESS',
          content: (
            <ErrorBoundary>
              <BillingAddress
                isAccountLoggedIn={!token}
                cartId={quote.id}
                addresses={addresses}
                selectedShippingAddress={parseAddress(
                  quote.shipping_addresses?.[0]
                )}
                selectedBillingAddress={parseAddress(quote.billing_address)}
                handleNext={handleNext}
                handlePrev={handlePrev}
              />
            </ErrorBoundary>
          ),
        },
        {
          label: t('Payment'),
          index: 'PAYMENT',
          content: (
            <ErrorBoundary>
              <Payment
                isAccountLoggedIn={!token}
                availablePaymentMethods={quote?.available_payment_methods}
                cartId={quote.id}
                handleNext={handleNext}
                selectedPaymentMethod={quote?.selected_payment_method}
                selectedShippingMethod={
                  quote.shipping_addresses?.[0]?.selected_shipping_method
                }
                selectedShippingAddress={quote.shipping_addresses?.[0]}
                selectedBillingAddress={quote.billing_address}
                isVirtual={quote?.is_virtual}
                handlePrev={handlePrev}
              />
            </ErrorBoundary>
          ),
        },
          // {
      //   label: t('Review Order'),
      //   index: 'REVIEW-ORDER',
      //   content: (
      //     <ErrorBoundary>
      //       <ReviewOrder
      //         cartId={quote.id}
      //         token={token || ''}
      //         isVirtual={quote?.is_virtual}
      //         handleNext={handleNext}
      //         handlePrev={handlePrev}
      //         isAccountLoggedIn={!token}
      //         selectedBillingAddress={quote.billing_address}
      //         selectedShippingAddress={quote.shipping_addresses?.[0]}
      //         selectedPaymentMethod={quote?.selected_payment_method}
      //         selectedShippingMethod={
      //           quote.shipping_addresses?.[0]?.selected_shipping_method
      //         }
      //       />
      //     </ErrorBoundary>
      //   ),
      // },
      ]
    : [];

  if (quote && !quote.is_virtual) {
    steps.splice(
      1,
      0,
      {
        label: t('Shipping Address'),
        index: 'SHIPPING-ADDRESS',
        content: (
          <ErrorBoundary>
            {' '}
            <ShippingAddress
              isAccountLoggedIn={!!token}
              addresses={addresses}
              loading={loading}
              cartId={quote.id}
              token={token || ''}
              selectedShippingAddress={parseAddress(
                quote.shipping_addresses?.[0]
              )}
              refetchAddress={refetch}
              handleNext={handleNext}
              handlePrev={handlePrev}
            />
          </ErrorBoundary>
        ),
      },
      {
        label: t('Shipping Method'),
        index: 'SHIPPING-METHOD',
        content: (
          <ErrorBoundary>
            <ShippingMethods
              isAccountLoggedIn={!token}
              token={token || ''}
              cartId={quote.id}
              availableShippingMethods={
                quote.shipping_addresses?.[0]?.available_shipping_methods
              }
              selectedShippingMethod={
                quote.shipping_addresses?.[0]?.selected_shipping_method
              }
              handleNext={handleNext}
              handlePrev={handlePrev}
            />
          </ErrorBoundary>
        ),
      }
    );
  }

  if (token) {
    steps = steps.filter((object) => {
      return object?.label !== t('Personal Details');
    });
  }

  return (
    <Containers className="pb-0 -lg:-mb-12 -md:px-2.5">
      <Typography className="mb-4 -lg:-mt-4 -md:px-4" variant="h2">
        {t('Checkout')}
      </Typography>
      <div className="gap-7 lg:grid lg:grid-cols-11 -lg:flex -lg:flex-col">
        <ErrorBoundary>
          {' '}
          <div className="mx-3 lg:hidden">
            <OrderSummary onClick={SHowItems} show={show} />
          </div>
        </ErrorBoundary>
        <ErrorBoundary>
          <div className="lg:col-span-6 lg:rtl:order-1">
            <CheckoutLayout>
              <Box sx={{ minWidth: '100%', m: 0 }}>
                <Stepper
                  className="[&_.MuiStepConnector-root]:hidden [&_.MuiStepConnector-root]:!border-0 [&_.MuiStepConnector-root]:border-solid [&_.MuiStepConnector-root]:border-[#c6c6c6] [&_.MuiStepConnector-root]:shadow-[unset] [&_.MuiStepConnector-root]:ltr:ml-[13px] [&_.MuiStepConnector-root]:ltr:border-l [&_.MuiStepConnector-root]:rtl:mr-[13px] [&_.MuiStepConnector-root]:rtl:flex-row-reverse [&_.MuiStepConnector-root]:rtl:border-r [&_.MuiStepConnector-root]:lg:flex"
                  activeStep={activeStep}
                  orientation="vertical"
                >
                  {steps.map((step, index) => (
                    <Step className="-lg:my-3" key={step.index}>
                      <StepLabel
                        icon={
                          activeStep <= index ? (
                            <CheckCircleIcon className="ml-px bg-white rounded-full -lg:hidden" />
                          ) : (
                            <CheckCircleIcon className="ml-px bg-white rounded-full text-iconCheckout -lg:hidden" />
                          )
                        }
                        StepIconProps={{
                          classes: {
                            root: '-lg:hidden ',
                          },
                        }}
                        className="pt-1 [&>span]:!border-checkoutBorder rtl:flex-row-reverse"
                        sx={{
                          ' > span:last-child': {
                            m: '0px 8px 0px 0.29rem',

                            border: '1px solid',
                            borderRadius: 0.5,
                            borderBottomLeftRadius: 0,
                            borderBottomRightRadius: 0,
                            mb: -1.125,
                          },
                        }}
                      >
                        <Typography
                          className="p-2 text-CheckoutLabel"
                          fontSize={16}
                          fontWeight={600}
                        >
                          {step.label}
                        </Typography>
                      </StepLabel>
                      <StepContent className="checkoutLayout">
                        {step.content}
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Box>
            </CheckoutLayout>
          </div>
        </ErrorBoundary>

        <ErrorBoundary>
          <div className="lg:col-span-5 -lg:hidden">
            <OrderSummary />
          </div>
        </ErrorBoundary>
      </div>
    </Containers>
  );
};

export default CheckoutHome;

/**
 * Generating data at build time.
 *
 * Fetching Customer Address at SSR
 * @param {Object} Context - props
 * @returns {customerAddresses, countries}
 */
export async function getServerSideProps({ req }: PageInterface) {
  const session = await getSession({ req });
  const storeCode = getCookie(SELECTED_STORE);
  const token = session?.user?.token || null;
  const data = token
    ? await graphqlRequest({
        query: CustomerAddressQuery,
        options: {
          context: {
            headers: {
              Authorization: `Bearer ${token}`,
              store: storeCode,
            },
          },
          fetchPolicy: 'no-cache',
        },
      })
    : null;
  return {
    props: {
      customerAddressesData: data || null,
    },
  };
}
