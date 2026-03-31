/**
 * Adyen Payment Strategy Implementation
 * Implements Adobe Commerce headless integration flow
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import {
  GET_ADYEN_PAYMENT_METHODS,
  SET_ADYEN_CC_PAYMENT_METHOD,
  SET_ADYEN_HPP_PAYMENT_METHOD,
  SET_ADYEN_ONECLICK_PAYMENT_METHOD,
  PLACE_ORDER_WITH_ADYEN,
  GET_ADYEN_PAYMENT_STATUS,
  HANDLE_ADYEN_PAYMENT_DETAILS,
} from '@voguish/module-quote/graphql/mutations/adyen-payment.graphql';
import {
  IPaymentStrategy,
  PaymentMethodData,
  PaymentMethodsResponse,
  PlaceOrderResult,
  PaymentDetailsResult,
} from './PaymentStrategy.interface';
import { AdyenPaymentStatus, ADYEN_PAYMENT_METHODS } from '@voguish/module-quote/types/adyen.types';

export class AdyenPaymentStrategy implements IPaymentStrategy {
  constructor(
    private apolloClient: ApolloClient<NormalizedCacheObject>,
    private token?: string | null,
    private storeCode?: string | null
  ) { }

  private getAuthContext() {
    return {
      headers: {
        Authorization: this.token ? `Bearer ${this.token}` : '',
        Store: this.storeCode || process.env.DEFAULT_STORE_CODE || 'default',
      }
    };
  }

  /**
   * Step 1: Get available payment methods
   * Retrieves payment methods from Adobe Commerce backend
   */
  async getPaymentMethods(
    cartId: string,
    shopperLocale?: string
  ): Promise<PaymentMethodsResponse> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_ADYEN_PAYMENT_METHODS,
        variables: {
          cartId,
          shopperLocale: shopperLocale || 'en-US',
        },
        context: this.getAuthContext(),
        fetchPolicy: 'network-only',
      });

      if (!data?.adyenPaymentMethods) {
        throw new Error('Failed to retrieve payment methods');
      }

      return data.adyenPaymentMethods;
    } catch (error) {
      console.error('Error fetching Adyen payment methods:', error);
      throw error;
    }
  }

  /**
   * Step 2: Set payment method on cart
   * Determines if it's a card, HPP, or oneclick payment method
   */
  async setPaymentMethod(
    cartId: string,
    paymentData: PaymentMethodData
  ): Promise<boolean> {
    try {
      const paymentCode = paymentData.code;

      if (paymentCode === ADYEN_PAYMENT_METHODS.CREDIT_CARD) {
        return await this.setCardPaymentMethod(cartId, paymentData);
      }
      else if (paymentCode === ADYEN_PAYMENT_METHODS.HPP) {
        return await this.setHPPPaymentMethod(cartId, paymentData);
      }
      else if (paymentCode === ADYEN_PAYMENT_METHODS.ONE_CLICK) {
        return await this.setOneclickPaymentMethod(cartId, paymentData);
      }
      // Fallback for other Adyen payment methods
      else {
        console.warn(`Unknown Adyen payment code: ${paymentCode}, treating as HPP`);
        return await this.setHPPPaymentMethod(cartId, paymentData);
      }
    } catch (error) {
      console.error('Error setting payment method:', error);
      throw error;
    }
  }

  /**
   * Set credit card payment method
   */
  private async setCardPaymentMethod(
    cartId: string,
    paymentData: PaymentMethodData
  ): Promise<boolean> {

    const variables = {
      cartId,
      ccType: paymentData.cc_type || this.getCardType(paymentData.stateData),
      stateData: JSON.stringify(paymentData.stateData),
      recurringProcessingModel: paymentData.recurringProcessingModel,
      comboCardType: paymentData.comboCardType,
      guestEmail: paymentData.guestEmail,
      numberOfInstallments: paymentData.numberOfInstallments,
      returnUrl: paymentData.returnUrl,
    };


    const { data, errors } = await this.apolloClient.mutate({
      mutation: SET_ADYEN_CC_PAYMENT_METHOD,
      variables,
      context: this.getAuthContext(),
      errorPolicy: 'all',
    });

    if (errors && errors.length > 0) {
      console.error('Set payment method errors:', errors);
      throw new Error(errors[0].message || 'Failed to set payment method');
    }


    return !!data?.setPaymentMethodOnCart?.cart?.selected_payment_method;
  }

  /**
   * Set HPP (Hosted Payment Page) payment method - for alternative payment methods
   */
  private async setHPPPaymentMethod(
    cartId: string,
    paymentData: PaymentMethodData
  ): Promise<boolean> {
    const { data } = await this.apolloClient.mutate({
      mutation: SET_ADYEN_HPP_PAYMENT_METHOD,
      variables: {
        cartId,
        brandCode: paymentData.brand_code || paymentData.type,
        stateData: JSON.stringify(paymentData.stateData),
        recurringProcessingModel: paymentData.recurringProcessingModel,
        guestEmail: paymentData.guestEmail,
        returnUrl: paymentData.returnUrl,
        dfValue: paymentData.dfValue,
      },
      context: this.getAuthContext(),
    });

    return !!data?.setPaymentMethodOnCart?.cart?.selected_payment_method;
  }

  /**
   * Set Oneclick payment method - for stored payment methods
   */
  private async setOneclickPaymentMethod(
    cartId: string,
    paymentData: PaymentMethodData
  ): Promise<boolean> {
    const { data } = await this.apolloClient.mutate({
      mutation: SET_ADYEN_ONECLICK_PAYMENT_METHOD,
      variables: {
        cartId,
        stateData: JSON.stringify(paymentData.stateData),
      },
      context: this.getAuthContext(),
    });
    return !!data?.setPaymentMethodOnCart?.cart?.selected_payment_method;
  }


  /**
   * Step 3: Place order
   */
  async placeOrder(cartId: string): Promise<PlaceOrderResult> {
    try {

      const { data, errors } = await this.apolloClient.mutate({
        mutation: PLACE_ORDER_WITH_ADYEN,
        variables: { cartId },
        context: this.getAuthContext(),
        errorPolicy: 'all',
      });


      if (errors && errors.length > 0) {
        console.error('GraphQL Errors:', errors);
        throw new Error(errors[0].message || 'GraphQL error occurred');
      }

      if (!data?.placeOrder?.order) {
        throw new Error('Failed to place order - no order data returned');
      }

      const rawAction = data.placeOrder.order.adyen_payment_status?.action;
      let parsedAction = rawAction;
      if (typeof rawAction === 'string' && rawAction) {
        try {
          parsedAction = JSON.parse(rawAction);
        } catch (e) {
          console.error('[Adyen] Failed to parse action JSON:', e);
          parsedAction = undefined;
        }
      }

      return {
        order_number: data.placeOrder.order.order_number,
        cart_id: data.placeOrder.order.cart_id,
        adyen_payment_status: data.placeOrder.order.adyen_payment_status
          ? {
            is_final: data.placeOrder.order.adyen_payment_status.isFinal,
            result_code: data.placeOrder.order.adyen_payment_status.resultCode,
            action: parsedAction,
            additional_data: data.placeOrder.order.adyen_payment_status.additionalData,
          }
          : undefined,
      };
    } catch (error: any) {
      console.error('Error Type:', error.constructor.name);
      if (error.graphQLErrors) {
        console.error('GraphQL Errors:', JSON.stringify(error.graphQLErrors, null, 2));
      }

      console.error('Full Error Object:', JSON.stringify(error, null, 2));

      throw error;
    }
  }

  /**
   * Step 4: Check payment status
   */
  async getPaymentStatus(
    orderNumber: string,
    cartId: string
  ): Promise<AdyenPaymentStatus> {
    try {
      const { data } = await this.apolloClient.query({
        query: GET_ADYEN_PAYMENT_STATUS,
        variables: { orderNumber, cartId },
        context: this.getAuthContext(),
        fetchPolicy: 'network-only',
      });

      if (!data?.adyenPaymentStatus) {
        throw new Error('Failed to retrieve payment status');
      }

      return {
        is_final: data.adyenPaymentStatus.isFinal,
        result_code: data.adyenPaymentStatus.resultCode,
        action: data.adyenPaymentStatus.action,
        additional_data: data.adyenPaymentStatus.additionalData,
      };
    } catch (error) {
      console.error('Error fetching payment status:', error);
      throw error;
    }
  }

  /**
   * Step 5: Handle additional payment details (3DS, redirects, etc.)
   */
  async handleAdditionalDetails(
    cartId: string,
    payload: any
  ): Promise<PaymentDetailsResult> {
    try {
      const { data } = await this.apolloClient.mutate({
        mutation: HANDLE_ADYEN_PAYMENT_DETAILS,
        variables: {
          cartId,
          payload: JSON.stringify(payload),
        },
        context: this.getAuthContext(),
      });

      if (!data?.adyenPaymentDetails) {
        throw new Error('Failed to process additional payment details');
      }

      const rawDetailsAction = data.adyenPaymentDetails.action;
      let parsedDetailsAction = rawDetailsAction;
      if (typeof rawDetailsAction === 'string' && rawDetailsAction) {
        try {
          parsedDetailsAction = JSON.parse(rawDetailsAction);
        } catch (e) {
          console.error('[Adyen] Failed to parse additional details action:', e);
          parsedDetailsAction = undefined;
        }
      }

      return {
        isFinal: data.adyenPaymentDetails.isFinal,
        resultCode: data.adyenPaymentDetails.resultCode,
        action: parsedDetailsAction,
        additionalData: data.adyenPaymentDetails.additionalData,
      };
    } catch (error) {
      console.error('Error handling additional payment details:', error);
      throw error;
    }
  }

  /**
   * Helper: Get card type from state data
   */
  private getCardType(stateData: any): string {
    const brand = stateData?.paymentMethod?.brand || stateData?.brand;

    // Map Adyen brand codes to Adobe Commerce card types
    const brandMap: Record<string, string> = {
      'visa': 'VI',
      'mc': 'MC',
      'amex': 'AE',
      'discover': 'DI',
      'jcb': 'JCB',
      'diners': 'DN',
      'maestro': 'SM',
      'bcmc': 'BC',
      'cartebancaire': 'CB',
    };

    return brandMap[brand?.toLowerCase()] || 'VI';
  }
}
