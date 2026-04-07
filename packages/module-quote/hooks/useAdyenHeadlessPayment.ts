/**
 * Adyen Headless Payment Hook
 * Implements Adobe Commerce headless integration with Strategy Pattern
 * 
 * @see https://docs.adyen.com/plugins/adobe-commerce/headless-integration
 */

import { useCallback, useMemo, useRef, useState } from 'react';

import { useApolloClient } from '@apollo/client';
import { SELECTED_STORE, STORE_CODE, STORE_CONFIG, getKeyFromStorage, getLocalStorage } from '@store/local-storage';
import { useToken } from '@voguish/module-customer/hooks/useToken';
import { AdyenPaymentStatus } from '@voguish/module-quote/types/adyen.types';
import { PaymentStrategyFactory } from '@voguish/module-quote/utils/payment-strategies';
import {
  PaymentMethodData,
  PaymentMethodsResponse,
} from '@voguish/module-quote/utils/payment-strategies/PaymentStrategy.interface';
import { getCookie } from 'cookies-next';
import { useTranslation } from 'next-i18next';

export interface UseAdyenHeadlessPaymentOptions {
  cartId: string;
  shopperLocale?: string;
  onPaymentSuccess?: (orderNumber: string) => void;
  onPaymentError?: (error: string) => void;
}

export interface UseAdyenHeadlessPaymentReturn {
  // Step 1: Get payment methods
  getPaymentMethods: () => Promise<PaymentMethodsResponse | null>;
  paymentMethods: PaymentMethodsResponse | null;

  // Step 2 & 3: Submit payment (set method + place order)
  submitPayment: (paymentData: PaymentMethodData) => Promise<AdyenPaymentStatus | null>;

  // Step 4: Check payment status
  checkPaymentStatus: (orderNumber: string) => Promise<AdyenPaymentStatus | null>;

  // Step 5: Handle additional actions (3DS, redirects)
  handleAdditionalDetails: (details: any) => Promise<AdyenPaymentStatus | null>;

  // State
  isLoading: boolean;
  isProcessing: boolean;
  error: string | null;
  currentOrderNumber: string | null;
}

export interface AdditionalDetailsPayload {
  details: Record<string, string>;
  paymentData?: string;
}

export const useAdyenHeadlessPayment = ({
  cartId,
  shopperLocale = 'en-US',
  onPaymentSuccess,
  onPaymentError,
}: UseAdyenHeadlessPaymentOptions): UseAdyenHeadlessPaymentReturn => {
  const apolloClient = useApolloClient();
  const token = useToken();
  const storeCode =
    getCookie(SELECTED_STORE) ||
    getLocalStorage(STORE_CODE) ||
    getKeyFromStorage(STORE_CONFIG, 'store_code') ||
    process.env.DEFAULT_STORE_CODE;

  const strategyFactory = useMemo(
    () => new PaymentStrategyFactory(apolloClient as any, token, storeCode as string | null),
    [apolloClient, token, storeCode]
  );

  // Memoize strategy getter to prevent unnecessary recreations
  const getStrategy = useCallback(
    (paymentCode: string) => strategyFactory.getStrategy(paymentCode),
    [strategyFactory]
  );

  // State management
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentOrderNumberRef = useRef<string | null>(null);
  const [currentOrderNumber, setCurrentOrderNumber] = useState<string | null>(null);

  const updateCurrentOrderNumber = useCallback((orderNumber: string) => {
    currentOrderNumberRef.current = orderNumber;
    setCurrentOrderNumber(orderNumber);
  }, []);

  const onPaymentSuccessRef = useRef(onPaymentSuccess);
  onPaymentSuccessRef.current = onPaymentSuccess;
  const onPaymentErrorRef = useRef(onPaymentError);
  onPaymentErrorRef.current = onPaymentError;

  const paymentInProgressRef = useRef(false);
  const detailsInProgressRef = useRef(false);
  const { t } = useTranslation('common');
  const handlePaymentResult = useCallback(
    async (status: AdyenPaymentStatus, orderNumber: string): Promise<AdyenPaymentStatus> => {

      if (status.is_final) {
        if (['Authorised', 'Received', 'Pending'].includes(status.result_code)) {
          onPaymentSuccessRef.current?.(orderNumber);
        } else if (['Refused', 'Error', 'Cancelled'].includes(status.result_code)) {
          const errorMsg = `Payment ${status.result_code.toLowerCase()}`;
          onPaymentErrorRef.current?.(errorMsg);
        } else if (status.result_code === 'PresentToShopper') {
          console.log('[Adyen] Present payment details to shopper');
        }
      } else if (status.action) {
        console.log('[Adyen] Additional action required:', status.action.type);
      }

      return status;
    },
    []
  );

  const getPaymentMethods = useCallback(async (): Promise<PaymentMethodsResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use any Adyen strategy (they all share the same getPaymentMethods implementation)
      const strategy = getStrategy('adyen_cc');
      const methods = await strategy.getPaymentMethods(cartId, shopperLocale);

      setPaymentMethods(methods);
      return methods;
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch payment methods';
      setError(errorMessage);
      console.error('[Adyen] Error fetching payment methods:', err);
      onPaymentErrorRef.current?.(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [cartId, shopperLocale, getStrategy]);

  const submitPayment = useCallback(
    async (paymentData: PaymentMethodData): Promise<AdyenPaymentStatus | null> => {
      if (paymentInProgressRef.current) {
        console.warn('[Adyen] Payment already in progress, skipping duplicate submit');
        return null;
      }

      try {
        paymentInProgressRef.current = true;
        setIsProcessing(true);
        setError(null);

        const strategy = getStrategy(paymentData.code);
        await strategy.setPaymentMethod(cartId, paymentData);

        const orderResult = await strategy.placeOrder(cartId);

        updateCurrentOrderNumber(orderResult.order_number);

        const paymentStatus = orderResult.adyen_payment_status;
        if (!paymentStatus) {
          throw new Error('No payment status returned from placeOrder');
        }

        const result = await handlePaymentResult(paymentStatus, orderResult.order_number);

        if (result?.is_final) {
          setIsProcessing(false);
          paymentInProgressRef.current = false;
        }

        return result;
      } catch (err: any) {
        let errorMessage = err.message || t('Payment submission failed');

        if (errorMessage && errorMessage.includes('A server error stopped your order from being placed')) {
          errorMessage = t('Payment failed. Please check your details or try another method.');
        }

        setError(errorMessage);
        console.error('[Adyen] Payment submission error:', err);
        onPaymentErrorRef.current?.(errorMessage);
        setIsProcessing(false);
        paymentInProgressRef.current = false;
        return null;
      }
    },
    [cartId, getStrategy, handlePaymentResult, updateCurrentOrderNumber]
  );

  const checkPaymentStatus = useCallback(
    async (orderNumber: string): Promise<AdyenPaymentStatus | null> => {
      try {
        setIsLoading(true);
        setError(null);

        const strategy = getStrategy('adyen_cc');
        const status = await strategy.getPaymentStatus(orderNumber, cartId);

        return status;
      } catch (err: any) {
        const errorMessage = err.message || 'Failed to check payment status';
        setError(errorMessage);
        console.error('[Adyen] Error checking payment status:', err);
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [cartId, getStrategy]
  );

  const handleAdditionalDetails = useCallback(
    async (payload: any): Promise<AdyenPaymentStatus | null> => {
      if (detailsInProgressRef.current) {
        console.warn('[Adyen] Additional details already being processed, skipping duplicate');
        return null;
      }

      try {
        detailsInProgressRef.current = true;
        setIsProcessing(true);
        setError(null);

        const orderNumber = currentOrderNumberRef.current;


        if (!orderNumber) {
          console.error('[Adyen] handleAdditionalDetails called with no currentOrderNumber');
          throw new Error('No order reference found. Please retry the payment.');
        }

        const strategy = getStrategy('adyen_cc');
        // Adobe Commerce backend requires 'orderId' injected into the plain state.data payload
        const finalPayload = {
          ...payload,
          orderId: orderNumber,
          orderNumber: orderNumber
        };

        const result = await strategy.handleAdditionalDetails(cartId, finalPayload);

        const status: AdyenPaymentStatus = {
          is_final: result.isFinal,
          result_code: result.resultCode,
          action: result.action,
          additional_data: result.additionalData,
          order_number: result.orderNumber,
        };

        const effectiveOrderNumber = result.orderNumber || orderNumber;
        if (result.orderNumber && result.orderNumber !== orderNumber) {
          updateCurrentOrderNumber(result.orderNumber);
        }

        const finalResult = await handlePaymentResult(status, effectiveOrderNumber);

        if (finalResult?.is_final) {
          setIsProcessing(false);
          paymentInProgressRef.current = false;
          detailsInProgressRef.current = false;
        } else {
          detailsInProgressRef.current = false;
        }

        return finalResult;
      } catch (err: any) {
        let errorMessage = err.message || t('Failed to process additional details');

        if (errorMessage && errorMessage.includes('A server error stopped your order from being placed')) {
          errorMessage = t('Payment failed. Please check your details or try another method.');
        }

        setError(errorMessage);
        console.error('[Adyen] Error handling additional details:', err);
        onPaymentErrorRef.current?.(errorMessage);
        setIsProcessing(false);
        paymentInProgressRef.current = false;
        detailsInProgressRef.current = false;
        return null;
      }
    },
    [cartId, getStrategy, handlePaymentResult, updateCurrentOrderNumber]
  );

  return {
    getPaymentMethods,
    paymentMethods,
    submitPayment,
    checkPaymentStatus,
    handleAdditionalDetails,
    isLoading,
    isProcessing,
    error,
    currentOrderNumber,
  };
};