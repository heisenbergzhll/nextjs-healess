import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import { Modal, IconButton, CircularProgress, Button } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { motion, AnimatePresence } from 'framer-motion';
import { useSetPaymentMethodOnCart, usePlaceOrder } from '@voguish/module-quote/hooks';
import { useNavigationBlocker } from '@voguish/module-quote/hooks/useNavigationBlocker';
import { setOrderId } from '@store/checkout';
import { removeFromLocalStorage } from '@store/local-storage';
import { useAppDispatch } from '@store/hooks';
import { CheckoutStepPayment } from '@voguish/module-quote/types';
import ErrorBoundary from '@voguish/module-theme/components/ErrorBoundary';
import {
  RadioInputField,
  RadioOptions,
} from '@voguish/module-theme/components/ui/Form/Elements';
import { useTranslation } from 'next-i18next';
import { FieldValues, useForm, Controller } from 'react-hook-form';
import { useState } from 'react';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { ButtonMui } from '@voguish/module-theme/components/ui/ButtonMui';
import { getFormattedPrice, isValidObject } from '@utils/Helper';
import { BRAND_HEX_CODE } from '@utils/Constants';
import FormWrapper from './FormWrapper';
import AddressCard from './Address/AddressCard';
import dynamic from 'next/dynamic';
import { ADYEN_PAYMENT_METHODS } from '@packages/module-quote/types/adyen.types';


const ArrowBack = dynamic(() => import('@mui/icons-material/ArrowBack'));
const AdyenHeadlessCheckout = dynamic(
  () => import('./AdyenPayment/AdyenHeadlessCheckout'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-96">
        <CircularProgress className="text-brand" />
      </div>
    ),
  }
);

/**
 * Order Processing Component
 */
const OrderProcess = () => {
  const { t } = useTranslation('common');
  return (
    <div className="grid pt-2 text-center">
      <CircularProgress
        size={50}
        style={{ color: BRAND_HEX_CODE, margin: 'auto' }}
      />
      <p className="my-2 mt-6 text-base font-semibold">
        {t('Order is Being Processed')}
      </p>
      <p className="mb-4 text-sm">
        {t('Your payment was received. Please wait while we complete your order')} —{' '}
        <strong className="text-brand">{t('do not refresh')}</strong> {t('or')}{' '}
        <strong className="text-brand">{t('close the tab')}</strong>.
      </p>
    </div>
  );
};

/**
 * Payment Failed Component
 */
export const PaymentFailed = ({
  tryAgainHandler,
}: {
  tryAgainHandler: () => void;
}) => {
  const { t } = useTranslation('common');
  return (
    <div className="grid pt-2 text-center">
      <WarningAmberIcon
        className="m-auto text-6xl text-red-600"
        style={{ margin: 'auto' }}
      />
      <p className="my-2 mt-4 text-xl font-semibold text-brand">
        {t('Payment Failed')}
      </p>
      <p className="mb-4 text-sm text-gray-700">
        {t('Unfortunately, your payment could not be processed. This may be due to a network issue or payment method decline.')}
      </p>
      <div className="m-auto">
        <ButtonMui
          className="h-12 mt-3 mb-2 rounded-none shadow-none w-36 hover:shadow-none"
          variant="contained"
          type="button"
          onClick={tryAgainHandler}
        >
          {t('Try Again')}
        </ButtonMui>
      </div>
    </div>
  );
};

/**
 * Payment Success Component
 */
export const PaymentSuccess = () => {
  const { t } = useTranslation('common');
  return (
    <div className="grid pt-2 text-center">
      <CheckCircleOutlineIcon
        className="m-auto text-6xl text-green-600"
        style={{ margin: 'auto' }}
      />
      <p className="my-2 mt-4 text-xl font-semibold text-brand">
        {t('Payment Successful')}
      </p>
      <p className="mb-2 text-sm text-gray-700">
        {t('Your payment was successful.')}
      </p>
      <p className="mb-4 text-sm text-gray-600">
        {t('Your order will be')}{' '}
        <strong className="text-brand">{t('processed shortly')}</strong> — {t('please wait')}.
      </p>
    </div>
  );
};

/**
 * Payment Component
 * Handles payment method selection and payment gateway integration
 * Supports multiple payment gateways with extensible architecture
 */
const Payment = ({
  handlePrev,
  cartId,
  availablePaymentMethods,
  selectedPaymentMethod,
  selectedShippingMethod,
  selectedShippingAddress,
  selectedBillingAddress,
  isVirtual,
}: CheckoutStepPayment) => {
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  const setNavigationBlocking = useNavigationBlocker();
  const dispatch = useAppDispatch();
  
  // State for payment gateway modals
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showPlaceOrderModal, setShowPlaceOrderModal] = useState(false);
  const [selectedPaymentCode, setSelectedPaymentCode] = useState<string | null>(null);
  const [paymentGateway, setPaymentGateway] = useState<'adyen' | 'other' | null>(null);
  const [isPaymentProcessing, setIsPaymentProcessing] = useState(false);

  const paymentMethodOptions: RadioOptions[] =
    availablePaymentMethods
      ?.filter((method) => method?.code !== ADYEN_PAYMENT_METHODS.ONE_CLICK)
      .map((method) => ({
        label: method?.title || '',
        value: method?.code || '',
      })) || [];

  const {
    handleSubmit,
    control,
    watch,
  } = useForm({
    mode: 'onChange',
    defaultValues: {
      paymentMethod: selectedPaymentMethod?.code || paymentMethodOptions?.[0]?.value || '',
    },
  });
  
  const { setPaymentMethodsHandler, isInProcess } = useSetPaymentMethodOnCart();
  const { placeOrderHandler, isInProcess: inOrderInProgress } = usePlaceOrder();

  const selectedMethod = watch('paymentMethod');

  /**
   * Determine which payment gateway to use based on payment code
   */
  const getPaymentGateway = (paymentCode: string): 'adyen' | 'other' => {
    if (paymentCode?.startsWith('adyen_')) {
      return 'adyen';
    }
    // Add more gateways here in the future
    // if (paymentCode?.startsWith('stripe_')) return 'stripe';
    return 'other';
  };

  /**
   * Handle payment method selection and show place order modal
   */
  const selectPaymentMethod = async (data: FieldValues) => {
    if (!data?.paymentMethod) {
      showToast({
        message: t('Please select a payment method'),
        type: 'error',
      });
      return;
    }

    const gateway = getPaymentGateway(data.paymentMethod);
    
    if (gateway === 'adyen') {
      // Enable navigation blocking for Adyen payment
      setNavigationBlocking(true);
      try {
        await setPaymentMethodsHandler({
          cartId,
          paymentMethod: { code: data.paymentMethod },
        });
        
        // Open Adyen payment modal ONLY if successfully set
        setSelectedPaymentCode(data.paymentMethod);
        setPaymentGateway('adyen');
        setShowPaymentModal(true);
      } catch (e: any) {
        console.error('Failed to set payment method', e);
        showToast({
          message: e.message || t('Failed to set payment method. Please try again.'),
          type: 'error',
        });
        setNavigationBlocking(false);
      }
    } else {
      // For other payment methods, show place order modal
      setShowPlaceOrderModal(true);
    }
  };

  /**
   * Place order for non-gateway payments (like Check/Money Order)
   */
  const placeOrder = async () => {
    try {
      // Enable navigation blocking
      setNavigationBlocking(true);

      // Set payment method first
      await setPaymentMethodsHandler({
        cartId,
        paymentMethod: { code: selectedMethod },
      });

      placeOrderHandler(cartId, (redirectCallback?: () => void) => {
        setNavigationBlocking(false);
        setShowPlaceOrderModal(false);
        
        // Call the redirect callback if provided
        if (typeof redirectCallback === 'function') {
          redirectCallback();
        }
      });
    } catch (error: any) {
      setNavigationBlocking(false);
      setShowPlaceOrderModal(false);
      showToast({
        message: error?.message || t('Failed to place order'),
        type: 'error',
      });
    }
  };

  /**
   * Handle successful payment from Adyen
   */
  const handlePaymentSuccess = (orderNumber: string) => {
    setNavigationBlocking(true);
    setShowPaymentModal(false);
    setSelectedPaymentCode(null);
    setPaymentGateway(null);

    dispatch(setOrderId(orderNumber));
    showToast({
      message: t('Payment successful! Redirecting to order confirmation...'),
      type: 'success',
    });
    
    // Redirect to success page after a short delay
    setTimeout(() => {
      setNavigationBlocking(false);
      removeFromLocalStorage('UserAddressUse');
      window.location.href = `/checkout/${orderNumber}`;
    }, 500);
  };

  /**
   * Handle payment error from Adyen
   */
  const handlePaymentError = (error: string) => {
    setShowPaymentModal(false);
    setNavigationBlocking(false);
    showToast({
      message: error || t('Payment failed. Please try again.'),
      type: 'error',
    });
  };

  /**
   * Handle payment cancellation from Adyen
   */
  const handlePaymentCancel = () => {
    if (isPaymentProcessing) {
      showToast({
        message: t('Please wait while your payment is being processed'),
        type: 'warning',
      });
      return;
    }
    setShowPaymentModal(false);
    setSelectedPaymentCode(null);
    setPaymentGateway(null);
    setNavigationBlocking(false);
    setIsPaymentProcessing(false);
  };

  /**
   * Close place order modal
   */
  const handleClosePlaceOrderModal = () => {
    if (!inOrderInProgress && !isInProcess) {
      setShowPlaceOrderModal(false);
    }
  };

  /**
   * Render payment gateway modal based on selected gateway
   */
  const renderPaymentGateway = () => {
    if (!showPaymentModal || !selectedPaymentCode) return null;

    // Render appropriate payment gateway
    switch (paymentGateway) {
      case 'adyen':
        return (
          <AdyenHeadlessCheckout
            cartId={cartId}
            selectedPaymentCode={selectedPaymentCode}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentError={handlePaymentError}
            onPaymentCancel={handlePaymentCancel}
            onPaymentStateChange={(isProcessing) => {

              setIsPaymentProcessing(isProcessing);
              setNavigationBlocking(isProcessing);
            }}
          />
        );

      // Add more payment gateways here
      // case 'stripe':
      //   return <StripePaymentWrapper ... />;

      default:
        return null;
    }
  };

  return (
    <ErrorBoundary>
      <form className='pl-0 lg:pl-0.5' onSubmit={handleSubmit(selectPaymentMethod)}>
        <FormWrapper>
          {/* Payment Method Selection */}
          <Box sx={{ mt: 1, width: '100%' }}>
            <Typography variant="subtitle1">{t('Payment Option')}</Typography>
            <Grid
              sx={{ 'div:last-child': { display: 'grid' } }}
              justifyContent={{ md: 'space-between' }}
              className={isInProcess ? 'cursor-wait' : ''}
            >
              <Controller
                name="paymentMethod"
                control={control}
                rules={{ required: t('Select Payment Method') }}
                render={({ field }) => (
                  <RadioInputField
                    {...field}
                    id="payment-method-1"
                    row
                    options={paymentMethodOptions}
                  />
                )}
              />
            </Grid>
          </Box>

          {/* Order Review Section */}
          <Box sx={{ mt: 3, width: '100%' }}>
            <Typography variant="subtitle1">{t('Review')}</Typography>
            <Grid className="grid gap-7 md:grid-cols-2">
              {!isVirtual && selectedShippingAddress ? (
                <span>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                    variant="subtitle1"
                  >
                    {t('Delivery address')}
                  </Typography>
                  <AddressCard address={selectedShippingAddress as any} />
                </span>
              ) : selectedBillingAddress ? (
                <span>
                  <Typography
                    sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                    variant="subtitle1"
                  >
                    {t('Billing address')}
                  </Typography>
                  <AddressCard address={selectedBillingAddress as any} />
                </span>
              ) : null}

              {/* Shipping Method & Payment Method */}
              <span>
                {!isVirtual && selectedShippingMethod && (
                  <ErrorBoundary>
                    <Typography
                      sx={{ fontSize: 16, fontWeight: 500, mb: 0.5 }}
                      variant="subtitle1"
                    >
                      {t('Shipping Mode')}
                    </Typography>
                    <Grid
                      className="rounded-md"
                      sx={{ backgroundColor: '#F3F3F3' }}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontSize: 16, fontWeight: 500 }}
                          color="text.main"
                        >
                          {`${selectedShippingMethod?.carrier_title} - ${getFormattedPrice(
                            selectedShippingMethod?.amount.value,
                            selectedShippingMethod?.amount.currency
                          )}`}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </ErrorBoundary>
                )}

                {selectedPaymentMethod?.title && (
                  <>
                    <Typography
                      sx={{ fontSize: 16, fontWeight: 500, mt: 2, mb: 0.5 }}
                      variant="subtitle1"
                    >
                      {t('Payment Mode')}
                    </Typography>
                    <Grid
                      className="rounded-md"
                      sx={{ backgroundColor: '#F3F3F3' }}
                    >
                      <CardContent>
                        <Typography
                          variant="subtitle1"
                          sx={{ fontSize: 16, fontWeight: 500 }}
                          color="text.main"
                        >
                          {selectedPaymentMethod.title}
                        </Typography>
                      </CardContent>
                    </Grid>
                  </>
                )}
              </span>
            </Grid>
          </Box>
        </FormWrapper>

        {/* Form Actions */}
        <Grid className="flex items-center justify-between w-full py-5">
          <Button
            onClick={handlePrev}
            className="flex px-1 space-x-3 font-normal tracking-widest"
            sx={{ color: '#2C3145', padding: 0.5, minWidth: 0 }}
          >
            <ArrowBack className="text-[16px] rtl:rotate-180 rounded-full" />
            <span>{t('Return to Billing Address')}</span>
          </Button>

          <ButtonMui
            isLoading={isInProcess || false}
            className="rounded-none shadow-none md:w-1/3"
            variant="contained"
            type="submit"
          >
            {t('Proceed to Payment')}
          </ButtonMui>
        </Grid>
      </form>

      {/* Adyen Payment Gateway Modal */}
      {showPaymentModal && selectedPaymentCode && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-2">
          <div className="relative w-full max-w-[600px] max-h-[90vh] overflow-auto rounded-lg bg-white p-4 shadow-2xl">
            {/* Close button - hidden during payment processing */}
            {!isPaymentProcessing && (
              <button
                onClick={handlePaymentCancel}
                aria-label={t('Close')}
                type="button"
                className="bg-white/80 rounded-full absolute top-4 right-4 z-20 cursor-pointer border-none text-2xl leading-none text-closeIconColor shadow-md hover:bg-white transition-all"
              >
                ×
              </button>
            )}
            
            {/* Warning message when processing */}
            {isPaymentProcessing && (
              <div className="absolute top-4 right-4 z-20 bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2 text-xs text-yellow-800 shadow-md">
                <span className="font-semibold">{t('Payment Processing')}</span>
                <br />
                <span>{t('Please do not close')}</span>
              </div>
            )}
            {renderPaymentGateway()}
          </div>
        </div>
      )}

      {/* Place Order Modal (for non-gateway payments) */}
      <Modal
        open={showPlaceOrderModal}
        aria-labelledby="place-order-modal-title"
        aria-describedby="place-order-modal-description"
        slotProps={{
          backdrop: {
            sx: {
              backdropFilter: 'blur(6px)',
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
          },
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '100%',
            minHeight: '300px',
            maxWidth: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: 2,
            p: 1,
            px: 2,
            pb: 2.5,
          }}
          component={motion.div}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mb={2}
          >
            <Typography id="place-order-modal-title" variant="h4" component="h2">
              {inOrderInProgress ? t('Order') : t('Place Order')}
            </Typography>
            {inOrderInProgress || isInProcess ? (
              ''
            ) : (
              <IconButton onClick={handleClosePlaceOrderModal}>
                <CloseIcon className="text-brand" />
              </IconButton>
            )}
          </Box>

          <AnimatePresence mode="wait">
            <motion.div
              key={inOrderInProgress ? 'order' : 'place-order'}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {inOrderInProgress ? (
                <OrderProcess />
              ) : (
                <Box id="place-order-modal-description">
                  {/* Order Summary in Modal */}
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      {t('Order Summary')}
                    </Typography>
                    
                    <Grid className="grid gap-4">
                      {/* Address */}
                      {!isVirtual && selectedShippingAddress ? (
                        <Box>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}
                            color="text.secondary"
                          >
                            {t('Delivery Address')}
                          </Typography>
                          <AddressCard address={selectedShippingAddress as any} />
                        </Box>
                      ) : selectedBillingAddress ? (
                        <Box>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}
                            color="text.secondary"
                          >
                            {t('Billing Address')}
                          </Typography>
                          <AddressCard address={selectedBillingAddress as any} />
                        </Box>
                      ) : null}

                      {/* Shipping Method */}
                      {!isVirtual && selectedShippingMethod && (
                        <Box>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}
                            color="text.secondary"
                          >
                            {t('Shipping Method')}
                          </Typography>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: '#F3F3F3',
                              borderRadius: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: 14 }}>
                              {`${selectedShippingMethod.carrier_title} - ${getFormattedPrice(
                                selectedShippingMethod.amount.value,
                                selectedShippingMethod.amount.currency
                              )}`}
                            </Typography>
                          </Box>
                        </Box>
                      )}

                      {/* Payment Method */}
                      {selectedMethod && (
                        <Box>
                          <Typography
                            sx={{ fontSize: 14, fontWeight: 600, mb: 1 }}
                            color="text.secondary"
                          >
                            {t('Payment Method')}
                          </Typography>
                          <Box
                            sx={{
                              p: 2,
                              backgroundColor: '#F3F3F3',
                              borderRadius: 1,
                            }}
                          >
                            <Typography sx={{ fontSize: 14 }}>
                              {paymentMethodOptions.find(
                                (opt) => opt.value === selectedMethod
                              )?.label || selectedMethod}
                            </Typography>
                          </Box>
                        </Box>
                      )}
                    </Grid>
                  </Box>

                  {/* Place Order Button */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <ButtonMui
                      variant="outlined"
                      onClick={handleClosePlaceOrderModal}
                      disabled={isInProcess}
                    >
                      {t('Cancel')}
                    </ButtonMui>
                    <ButtonMui
                      variant="contained"
                      onClick={placeOrder}
                      isLoading={isInProcess}
                      className="rounded-none shadow-none"
                    >
                      {t('Place Order')}
                    </ButtonMui>
                  </Box>
                </Box>
              )}
            </motion.div>
          </AnimatePresence>
        </Box>
      </Modal>
    </ErrorBoundary>
  );
};

export default Payment;
