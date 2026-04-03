/**
 * Adyen Headless Checkout Component - Production Ready
 * Implements Adobe Commerce headless integration with Adyen Web Components
 * Shows specific payment method based on selected Adobe Commerce payment code
 * 
 * @see https://docs.adyen.com/plugins/adobe-commerce/headless-integration
 */

'use client';

import { useEffect, useRef, useState } from 'react';
import { AdyenCheckout, Card, ApplePay, GooglePay } from '@adyen/adyen-web';
import '@adyen/adyen-web/styles/adyen.css';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import { useTranslation } from 'next-i18next';
import { useToast } from '@voguish/module-theme/components/toast/hooks';
import { useAdyenHeadlessPayment } from '@voguish/module-quote/hooks/useAdyenHeadlessPayment';
import { ADYEN_PAYMENT_METHODS } from '@voguish/module-quote/types/adyen.types';
import type { AdyenPaymentProps, AdyenPaymentState, AdyenError, AdyenPaymentMethod, AdyenCheckoutOptions } from '@voguish/module-quote/types/adyen.types';
import { useSelector } from 'react-redux';
import { RootState } from 'store';
import { STORE_CONFIG, getKeyFromStorage } from '@store/local-storage';
import { getFormattedPrice } from '@utils/Helper';
import { 
  createWalletPayment, 
  extractWalletConfig,
  shouldShowApplePay,
  shouldShowGooglePay,
  getPreferredWalletMethod,
  getAdyenAmount,
  getAdyenSupportedLocale,
  buildReturnUrl,
} from '@voguish/module-quote/utils/adyen-helpers';
import { BRAND_HEX_CODE } from '@utils/Constants';

interface AdyenHeadlessCheckoutProps extends AdyenPaymentProps {
  selectedPaymentCode: string;
}

const AdyenHeadlessCheckout = ({
  cartId,
  selectedPaymentCode,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel,
  onPaymentStateChange,
}: AdyenHeadlessCheckoutProps) => {

  
  const { t } = useTranslation('common');
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [paymentFinished, setPaymentFinished] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const dropinContainerRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(true);
  const initializedRef = useRef(false);
  const redirectProcessedRef = useRef(false);

  const lastActionPaymentDataRef = useRef<string | null>(null);

  const quote = useSelector((state: RootState) => state?.cart?.quote || null);
  const storeLocale: string =
    (getKeyFromStorage(STORE_CONFIG, 'locale') as string) || 'en_US';
  const shopperLocale: string = getAdyenSupportedLocale(storeLocale);
  
  const {
    getPaymentMethods,
    submitPayment,
    handleAdditionalDetails,
    isProcessing,
    error: paymentError,
  } = useAdyenHeadlessPayment({
    cartId,
    shopperLocale,
    onPaymentSuccess: (orderNumber) => onPaymentSuccess(orderNumber),
    onPaymentError: (error) => {
      console.error('[Adyen] Payment error from hook:', error);
      onPaymentError(error);
    },
  });

  const submitPaymentRef = useRef(submitPayment);
  submitPaymentRef.current = submitPayment;
  const handleAdditionalDetailsRef = useRef(handleAdditionalDetails);
  handleAdditionalDetailsRef.current = handleAdditionalDetails;
  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;
  const onPaymentErrorRef = useRef(onPaymentError);
  onPaymentErrorRef.current = onPaymentError;
  const onPaymentStateChangeRef = useRef(onPaymentStateChange);
  onPaymentStateChangeRef.current = onPaymentStateChange;

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    
    mountedRef.current = true;
    let dropinComponent: any = null;

    const initializeAdyenCheckout = async () => {

      try {
        setLoading(true);
        onPaymentStateChangeRef.current?.(true);

        const methods = await getPaymentMethods();

        if (!methods || !mountedRef.current) {
          throw new Error('Failed to fetch payment methods');
        }

        const paymentMethodsResponse = methods.paymentMethodsResponse;

        if (!paymentMethodsResponse) {
          throw new Error('No payment methods response received from server');
        }

        if (!paymentMethodsResponse.paymentMethods || !Array.isArray(paymentMethodsResponse.paymentMethods)) {
          throw new Error('Payment methods list is invalid or missing');
        }

        const clientKey = process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY;
        const environment = (process.env.NEXT_PUBLIC_ADYEN_ENVIRONMENT || 'test') as 'test' | 'live';

        if (!clientKey) {
          throw new Error('Adyen client key not configured');
        }

        const keyPrefix = clientKey.split('_')[0];
        if (keyPrefix !== environment) {
          console.warn(`[Adyen] Environment mismatch: clientKey prefix "${keyPrefix}" vs environment "${environment}"`);
        }

        const countryCode = 
          quote?.billing_address?.country?.code || 
          quote?.shipping_addresses?.[0]?.country?.code || 
          'US';

        const amount = getAdyenAmount(quote);


        // Step 2: Initialize Adyen Web Components
        const configuration: AdyenCheckoutOptions = {
          environment,
          clientKey,
          locale: shopperLocale, 
          countryCode, 
          amount, 
          paymentMethodsResponse, 
          
          paymentMethodsConfiguration: {
            threeDS2: {
              challengeWindowSize: '05'
            }
          },
          
          analytics: {
            enabled: false,
          },
          
          // Handle payment submission
          onSubmit: async (state: AdyenPaymentState, _element: any, actions: any) => {
            try {
              onPaymentStateChangeRef.current?.(true);

              const paymentMethod = state.data.paymentMethod;    
              const paymentCode = selectedPaymentCode;
              
              const paymentData = {
                code: paymentCode,
                type: paymentMethod.type,
                brand_code: paymentMethod.type,
                cc_type: paymentMethod.brand,
                stateData: state.data,
                returnUrl: buildReturnUrl('/api/adyen/return'),
              };

              const result = await submitPaymentRef.current(paymentData);

              if (!result) {
                throw new Error('Payment submission failed');
              }

              if (result.action) {
                const action = typeof result.action === 'string'
                  ? JSON.parse(result.action)
                  : result.action;
                  
                if (action?.paymentData) {
                  lastActionPaymentDataRef.current = action.paymentData;
                }
                
                if (actions?.resolve) {
                  actions.resolve({
                    resultCode: result.result_code,
                    action: action
                  });
                } else {
                  console.error('[Adyen] actions.resolve not available in onSubmit');
                }
              } else {
                setPaymentFinished(true);
                if (actions?.resolve) {
                  actions.resolve({ resultCode: result.result_code });
                }
              }
            } catch (error: unknown) {
              console.error('[Adyen] onSubmit error:', error);
              onPaymentStateChangeRef.current?.(false);
              if (actions?.reject) {
                actions.reject();
              }
            }
          },

          // Handle additional payment details (after 3DS, redirect, etc.)
          onAdditionalDetails: async (state: any, _element: any, actions: any) => {
            const detailKeys = state.data?.details ? Object.keys(state.data.details) : [];
            
            try {
              setIsVerifying(true);
              onPaymentStateChangeRef.current?.(true);
              
              const paymentDataToken = state.data?.paymentData || lastActionPaymentDataRef.current;
              
              const detailsPayload: any = {
                details: state.data.details,
              };

              if (paymentDataToken) {
                detailsPayload.paymentData = paymentDataToken;
              }
              const result = await handleAdditionalDetailsRef.current(detailsPayload);

              if (!result) {
                throw new Error('Failed to process additional details');
              }

              if (result.action) {
                setIsVerifying(false);
                
                const action = typeof result.action === 'string'
                  ? JSON.parse(result.action)
                  : result.action;
                  
                if (action?.paymentData) {
                  lastActionPaymentDataRef.current = action.paymentData;
                }

                
                if (actions?.resolve) {
                  actions.resolve({
                    resultCode: result.result_code,
                    action: action
                  });
                } else {
                  console.warn('[Adyen] actions.resolve not available in onAdditionalDetails. Result handled by hook.');
                }
              } else {
                setPaymentFinished(true);
                if (actions?.resolve) {
                  actions.resolve({ resultCode: result.result_code });
                } else {
                  console.log('[Adyen] actions undefined after final result — hook already handled outcome');
                }
              }
            } catch (error: unknown) {
              console.error('[Adyen] onAdditionalDetails error:', error);
              setIsVerifying(false);
              onPaymentStateChangeRef.current?.(false);
              if (actions?.reject) {
                actions.reject();
              } else {
                const errorMessage = error instanceof Error ? error.message : 'Payment verification failed';
                onPaymentErrorRef.current(errorMessage);
              }
            }
          },

          // v6 direct result callbacks — critical safety net for 3DS flows
          onPaymentCompleted: (result: any, _component: any) => {
            setPaymentFinished(true);
            onPaymentStateChangeRef.current?.(false);
          },
          onPaymentFailed: (result: any, _component: any) => {
            setPaymentFinished(true);
            onPaymentStateChangeRef.current?.(false);
          },

          // Handle errors
          onError: (error: AdyenError) => {

            const isCancellation = 
              error?.message?.startsWith('CANCEL') ||
              error?.name === 'CANCEL';
            
            if (isCancellation) {
              onPaymentStateChangeRef.current?.(false);
              if (typeof onPaymentCancel === 'function') {
                onPaymentCancel();
              }
              return;
            }
            
            onPaymentStateChangeRef.current?.(false);
            showToast({
              message: error.message || t('Payment error occurred'),
              type: 'error',
            });
          },
        };

        // Create Adyen Checkout Core instance
        let checkout;
        try {
          checkout = await AdyenCheckout(configuration as any);
        } catch (initError: any) {
          console.error('[Adyen] Checkout init error:', initError);
          if (initError.message?.includes('analytics') || initError.message?.includes('NETWORK_ERROR')) {
            configuration.analytics = { enabled: false };
            checkout = await AdyenCheckout(configuration as any);
          } else {
            throw initError;
          }
        }

        if (!checkout) {
          throw new Error('Failed to initialize Adyen Checkout');
        }

        setLoading(false);
        onPaymentStateChange?.(false);

        await new Promise(resolve => setTimeout(resolve, 100));

        if (!dropinContainerRef.current) {
          throw new Error('Container element not found');
        }

        if (!mountedRef.current) {
          console.log('Component unmounted, skipping component mount');
          return;
        }
        
        let paymentComponent;
        
        // Validate that the selected payment method is available
        const isPaymentMethodAvailable = (type: string) => {
          return paymentMethodsResponse.paymentMethods.some((pm: AdyenPaymentMethod) => pm.type === type);
        };
        
        if (selectedPaymentCode === ADYEN_PAYMENT_METHODS.CREDIT_CARD) {
          if (!isPaymentMethodAvailable('scheme')) {
            throw new Error('Credit card payment method is not available');
          }

          paymentComponent = new Card(checkout, {
            hasHolderName: true,
            holderNameRequired: true,
            billingAddressRequired: false,
            enableStoreDetails: false,
            styles: {
              base: {
                fontSize: '16px',
              },
            },
            _disableClickToPay: true,
            threeDS2: {
              challengeWindowSize: '05'
            }
          } as any);
        } else if (selectedPaymentCode === ADYEN_PAYMENT_METHODS.HPP) {

          const googlePayConfig = extractWalletConfig(paymentMethodsResponse.paymentMethods, 'googlepay');
          const applePayConfig = extractWalletConfig(paymentMethodsResponse.paymentMethods, 'applepay');

          if (!googlePayConfig && !applePayConfig) {
            throw new Error('Google Pay and Apple Pay are not available');
          }
          const paymentAmount = getAdyenAmount(quote);
          // Detect device and determine which wallet to show
          const showGooglePay = shouldShowGooglePay();
          const showApplePay = shouldShowApplePay();
           
          // Create a container div for payment methods
          const paymentMethodsContainer = document.createElement('div');
          paymentMethodsContainer.className = 'adyen-hpp-container';
          paymentMethodsContainer.style.display = 'flex';
          paymentMethodsContainer.style.flexDirection = 'column';
          paymentMethodsContainer.style.gap = '14px';
          
          const cleanupHandlers: Array<() => void> = [];
          
          // Create wallet payment components based on device
          if (showGooglePay && googlePayConfig) {
            const googlePay = await createWalletPayment(
              'googlepay',
              googlePayConfig,
              GooglePay,
              checkout,
              paymentAmount,
              countryCode,
              environment,
              paymentMethodsContainer
            );
            if (googlePay) {
              cleanupHandlers.push(googlePay);
            }
          }
          
          // Only show Apple Pay if device supports it and config is available
          if (showApplePay && applePayConfig) {
            const applePay = await createWalletPayment(
              'applepay',
              applePayConfig,
              ApplePay,
              checkout,
              paymentAmount,
              countryCode,
              environment,
              paymentMethodsContainer
            );
            if (applePay) {
              cleanupHandlers.push(applePay);
            }
          }
          
          // Mount the container to the main container
          if (dropinContainerRef.current) {
            dropinContainerRef.current.appendChild(paymentMethodsContainer);
          }
          
          // Store reference for cleanup with proper cleanup handlers
          paymentComponent = {
            mount: () => {}, // Already mounted
            unmount: () => {
              cleanupHandlers.forEach(cleanup => cleanup());
              // Remove container
              if (paymentMethodsContainer.parentNode) {
                paymentMethodsContainer.parentNode.removeChild(paymentMethodsContainer);
              }
            }
          } as any;
          
          // Hide loading after wallet buttons are rendered
          setTimeout(() => {
            if (mountedRef.current) {
              onPaymentStateChange?.(false);
            }
          }, 300);
          
          return;
        } else if (selectedPaymentCode === ADYEN_PAYMENT_METHODS.ONE_CLICK) {
          const storedMethods = paymentMethodsResponse.storedPaymentMethods;
          
          if (storedMethods && storedMethods.length > 0) {
            const storedMethodsContainer = document.createElement('div');
            storedMethodsContainer.className = 'adyen-stored-methods-container';
            storedMethodsContainer.style.display = 'flex';
            storedMethodsContainer.style.flexDirection = 'column';
            storedMethodsContainer.style.gap = '16px';
            
            const storedComponents: any[] = [];

            if (dropinContainerRef.current) {
              dropinContainerRef.current.appendChild(storedMethodsContainer);
            }

            for (const storedMethod of storedMethods) {
              const methodWrapper = document.createElement('div');
              methodWrapper.className = 'adyen-stored-method-item';
              methodWrapper.style.border = '1px solid #E5E7EB';
              methodWrapper.style.borderRadius = '8px';
              methodWrapper.style.padding = '16px';
              methodWrapper.style.backgroundColor = '#FAFAFA';
              
              const cardInfo = document.createElement('div');
              cardInfo.style.display = 'flex';
              cardInfo.style.alignItems = 'center';
              cardInfo.style.gap = '12px';
              cardInfo.style.marginBottom = '12px';
              cardInfo.innerHTML = `
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span style="font-weight: 600; font-size: 14px; text-transform: capitalize;">
                    ${storedMethod.brand || storedMethod.name || storedMethod.type}
                  </span>
                  ${storedMethod.lastFour ? `<span style="color: #6B7280; font-size: 14px;">•••• ${storedMethod.lastFour}</span>` : ''}
                  ${storedMethod.expiryMonth && storedMethod.expiryYear ? `<span style="color: #9CA3AF; font-size: 13px;">(${storedMethod.expiryMonth}/${storedMethod.expiryYear})</span>` : ''}
                </div>
                ${storedMethod.holderName ? `<span style="color: #6B7280; font-size: 13px;">${storedMethod.holderName}</span>` : ''}
              `;
              methodWrapper.appendChild(cardInfo);
              
              const mountPoint = document.createElement('div');
              mountPoint.className = 'adyen-stored-card-mount';
              methodWrapper.appendChild(mountPoint);
              
              storedMethodsContainer.appendChild(methodWrapper);
              
              // Create the Card component for this stored method
              const storedCard = new (Card as any)(checkout, {
                storedPaymentMethodId: storedMethod.id,
                hasHolderName: false,
                holderNameRequired: false,
                billingAddressRequired: false,
                enableStoreDetails: false,
                threeDS2: {
                  challengeWindowSize: '05'
                }
              });
              storedCard.mount(mountPoint);
              storedComponents.push(storedCard);
            }

            paymentComponent = {
              mount: () => { },
              unmount: () => {
                storedComponents.forEach(comp => {
                  try { comp.unmount(); } catch (e) { /* ignore */ }
                });
                if (storedMethodsContainer.parentNode) {
                  storedMethodsContainer.parentNode.removeChild(storedMethodsContainer);
                }
              },
            } as any;

            dropinComponent = paymentComponent;
            return;
          } else {
            throw new Error(t('You have no stored payment methods. Please select the standard Credit Card option.'));
          }
        } else {
          if (!isPaymentMethodAvailable('scheme')) {
            throw new Error('No valid payment method available for the selected option');
          }

          paymentComponent = new (Card as any)(checkout, {
            hasHolderName: true,
            holderNameRequired: true,
            billingAddressRequired: false,
            enableStoreDetails: true,
            threeDS2: {
              challengeWindowSize: '05'
            }
          });
        }

        dropinComponent = paymentComponent;
        
        // Mount the payment component
        paymentComponent.mount(dropinContainerRef.current);
        

      } catch (error: any) {
        console.error('[Adyen] Initialization error:', error);
        if (mountedRef.current) {
          setLoading(false);
          onPaymentStateChange?.(false);
          showToast({
            message: t('Unable to load payment. Please refresh the page or try a different payment method'),
            type: 'error',
          });
          onPaymentError(error.message || 'Initialization failed');
        }
      }
    };

    initializeAdyenCheckout();

    // Cleanup
    return () => {
      mountedRef.current = false;
      onPaymentStateChange?.(false);
      
      if (dropinComponent) {
        try {
          dropinComponent.unmount();
        } catch (e) {
          // Silently handle unmount errors
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartId]);

  // Update processing state
  useEffect(() => {
    onPaymentStateChange?.(isProcessing);
  }, [isProcessing, onPaymentStateChange]);

  useEffect(() => {
    // Prevent duplicate processing
    if (redirectProcessedRef.current) {
      return;
    }

    // Check for Adyen return data in URL hash
    const hash = window.location.hash;
    
    if (hash.startsWith('#adyen-return=')) {
      redirectProcessedRef.current = true;
      setIsVerifying(true);
      const encodedData = hash.split('=')[1];
      try {
        const paymentData = JSON.parse(atob(encodedData));
        
        // Build details object based on available data
        const details: any = {};
        
        // Modern 3DS2 parameters
        if (paymentData.redirectResult) {
          details.redirectResult = paymentData.redirectResult;
        } else if (paymentData.payload) {
          details.payload = paymentData.payload;
        }
        // Legacy 3DS1 parameters
        else if (paymentData.MD && paymentData.PaRes) {
          details.MD = paymentData.MD;
          details.PaRes = paymentData.PaRes;
        }

        if (Object.keys(details).length > 0) {
          handleAdditionalDetails({ details });
        } else {
          throw new Error('No valid payment data found');
        }
        
        window.history.replaceState(null, '', window.location.pathname);
      } catch (error) {
        setIsVerifying(false);
        showToast({
          message: t('Failed to process payment. Please try again.'),
          type: 'error',
        });
      }
    } else if (hash.startsWith('#adyen-error=')) {
      redirectProcessedRef.current = true;
      const errorType = hash.split('=')[1];
      showToast({
        message: t('Payment failed. Please try again.'),
        type: 'error',
      });
      window.history.replaceState(null, '', window.location.pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '400px',
          gap: 2,
        }}
      >
        <CircularProgress className='text-brand'/>
        <Typography>{t('Loading payment methods...')}</Typography>
      </Box>
    );
  }

  if (paymentError) {
    return (
      <Box sx={{ minHeight: '300px', p: 2 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {paymentError}
        </Alert>
        <button
          onClick={onPaymentCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          {t('Go Back')}
        </button>
      </Box>
    );
  }

  
  const getPaymentTitle = () => {
    switch (selectedPaymentCode) {
      case ADYEN_PAYMENT_METHODS.CREDIT_CARD:
        return t('Credit Card');
      case ADYEN_PAYMENT_METHODS.HPP:
        return t('Express Checkout');
      case ADYEN_PAYMENT_METHODS.ONE_CLICK:
        return t('Stored Payment Methods');
      default:
        return t('Select Payment Method');
    }
  };
  
  // Format amount for display using the same helper as OrderSummary
  const formatAmount = () => {
    const grandTotal = quote?.prices?.grand_total?.value
      ? getFormattedPrice(
          quote.prices.grand_total.value,
          quote.prices.grand_total.currency
        )
      : getFormattedPrice(0, 'USD');
    
    return grandTotal;
  };
  
  const displayAmount = formatAmount();
  
  return (
    <>
      <style jsx global>{`
        /* Make Expiry Date and Security Code appear on the same row */
        .adyen-checkout__card__exp-cvc {
          display: grid !important;
          grid-template-columns: 1fr 1fr !important;
          gap: 16px !important;
        }
        
        .adyen-checkout__field--expiryDate,
        .adyen-checkout__field--securityCode {
          width: 100% !important;
        }
        
        /* Ensure proper spacing for card form */
        .adyen-checkout__card__form {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        /* Allow 3DS challenge to take full height and remove inner scrollbar */
        .adyen-checkout__threeds2__challenge {
          min-height: 440px !important;
          max-height: none !important;
        }
        
        /* Responsive: Stack on very small mobile screens */
        @media (max-width: 360px) {
          .adyen-checkout__card__exp-cvc {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
      
      {selectedPaymentCode === ADYEN_PAYMENT_METHODS.HPP ? (
        <Box 
          sx={{ 
            width: '100%',
            maxWidth: { xs: '100%', sm: '480px' },
            minHeight: "300px",
            mx: 'auto',
            py: { xs: 2, sm: 3 },
          }}
        >
          {/* Header Section for Wallet Payments */}
          <Box sx={{ mb: { xs: 2, sm: 3 }, textAlign: 'center' }}>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 1, 
                fontWeight: 700, 
                fontSize: { xs: '1.5rem', sm: '1.75rem' },
                letterSpacing: '-0.025em',
              }}
              className="text-primary"
            >
              {getPaymentTitle()}
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 2,
                fontSize: { xs: '0.875rem', sm: '0.9375rem' },
              }}
              className='text-gray'
            >
              {t('Secure & fast payment')}
            </Typography>
            {displayAmount && (
              <Box
                sx={{
                  borderRadius: '12px',
                  py: { xs: 2, sm: 2.5 },
                  mb: 3,
                  border: '1px solid #E5E7EB',
                }}
                className="bg-colorBackground"
              >
                <Typography 
                  variant="h3" 
                  sx={{ 
                    fontWeight: 700, 
                    fontSize: { xs: '2rem', sm: '2.5rem' },
                    letterSpacing: '-0.02em',
                  }}
                  className='text-primary '
                >
                  {displayAmount}
                </Typography>
              </Box>
            )}
          </Box>
          
          {/* Adyen Drop-in Container */}
          <Box
            sx={{
              mb: 2,
            }}
          >
            <div 
              ref={dropinContainerRef} 
              id="adyen-dropin-container"
              style={{ width: '100%' }}
            />
          </Box>
          
          {!isProcessing && (
            <Box sx={{  mt: 2 }}>
              {/* OR Divider */}
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box sx={{ flex: 1, height: '1px' }} className="bg-colorBorder" />
                <Typography 
                  sx={{ 
                    color: '#9CA3AF', 
                    fontSize: '0.8125rem', 
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  {t('OR')}
                </Typography>
                <Box sx={{ flex: 1, height: '1px' }} className="bg-colorBorder" />
              </Box>
              
              <Box sx={{ textAlign: 'center', pb: 1 }}>
                <Typography
                  component="span"
                  onClick={onPaymentCancel}
                  sx={{
                    color: '#2563EB',
                    fontSize: { xs: '0.9375rem', sm: '1rem' },
                    fontWeight: 500,
                    cursor: 'pointer',
                    textDecoration: 'none',
                    borderBottom: '1px solid transparent',
                    transition: 'all 0.2s',
                    '&:hover': {
                      color: '#1D4ED8',
                      borderBottomColor: '#1D4ED8',
                    },
                  }}
                >
                  {t('Use another payment method')}
                </Typography>
              </Box>
            </Box>
          )}
        </Box>
      ) : (
        /* Credit Card and Other Payment Methods */
        <Box sx={{ width: '100%', minHeight: "400px" }}>
          <Typography 
            variant="h6" 
            sx={{ 
              mb: 1, 
              fontWeight: 600,
              fontSize: { xs: '1.25rem', sm: '1.5rem' },
            }}
            className='text-primary'
          >
            {getPaymentTitle()}
          </Typography>
          
          {/* Adyen Drop-in Container */}
          <Box sx={{ 
            mb: 2, 
            display: isVerifying || paymentFinished ? 'none' : 'block',
            '& .adyen-checkout__threeds2__challenge': {
              margin: '0 auto !important',
              width: '100% !important',
              maxWidth: '430px !important',
              height: '430px !important',
            },
            '& .adyen-checkout__iframe--threeDSIframe': {
              width: '100% !important',
              height: '100% !important',
            }
          }}>
            <div 
              ref={dropinContainerRef} 
              id="adyen-dropin-container"
              style={{ width: '100%' }}
            />
          </Box>
          {(isVerifying || paymentFinished) && (
            <div className="grid pt-2 text-center" style={{ minHeight: '320px', alignContent: 'center' }}>
              <CircularProgress size={50} style={{ color: BRAND_HEX_CODE, margin: 'auto' }} />
              <p className="my-2 mt-6 text-base font-semibold">
                {t('Order is Being Processed')}
              </p>
              <p className="mb-4 text-sm">
                {t('Your verification was received. Please wait while we complete your order')} —{' '}
                <strong className="text-brand">{t('do not refresh')}</strong> {t('or')}{' '}
                <strong className="text-brand">{t('close the tab')}</strong>.
              </p>
            </div>
          )}
        </Box>
      )}
    </>
  );
};

export default AdyenHeadlessCheckout;
