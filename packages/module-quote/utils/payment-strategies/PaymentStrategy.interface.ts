/**
 * Payment Strategy Interface
 * Defines the contract for all payment method implementations
 */

import { AdyenPaymentStatus } from '@voguish/module-quote/types/adyen.types';

export interface PaymentMethodData {
  code: string;
  type?: string;
  brand_code?: string;
  cc_type?: string;
  stateData: any;
  returnUrl?: string;
  recurringProcessingModel?: 'Subscription' | 'CardOnFile' | 'UnscheduledCardOnFile';
  // HPP-specific fields
  guestEmail?: string;
  dfValue?: string;
  // CC-specific fields
  comboCardType?: string;
  numberOfInstallments?: number;
}

export interface PaymentMethodsResponse {
  paymentMethodsResponse: {
    paymentMethods: Array<{
      name: string;
      type: string;
      brand?: string;
      brands?: string[];
      configuration?: {
        gatewayMerchantId?: string;
        merchantId?: string;
        merchantName?: string;
        [key: string]: any;
      };
      details?: Array<{
        key: string;
        optional?: boolean;
        type?: string;
        value?: string;
        items?: Array<{
          id: string;
          name: string;
        }>;
      }>;
      issuers?: Array<{
        id: string;
        name: string;
      }>;
    }>;
    storedPaymentMethods?: Array<{
      id: string;
      name: string;
      type: string;
      brand?: string;
      lastFour?: string;
      expiryMonth?: string;
      expiryYear?: string;
      holderName?: string;
      iban?: string;
      networkTxReference?: string;
      ownerName?: string;
      shopperEmail?: string;
      supportedShopperInteractions: string[];
    }>;
  };
  paymentMethodsExtraDetails: Array<{
    type: string;
    isOpenInvoice?: boolean;
    icon?: {
      url: string;
      width: number;
      height: number;
    };
    configuration?: {
      currency?: string;
      amount?: {
        currency: string;
        value: number;
      };
      [key: string]: any;
    };
  }>;
}

export interface PlaceOrderResult {
  order_number: string;
  order_id?: string;
  cart_id?: string;
  adyen_payment_status?: AdyenPaymentStatus;
}

export interface PaymentDetailsResult {
  isFinal: boolean;
  resultCode: string;
  action?: any;
  additionalData?: any;
  orderNumber?: string;
}

/**
 * Base Payment Strategy Interface
 */
export interface IPaymentStrategy {
  /**
   * Get available payment methods for the cart
   */
  getPaymentMethods(cartId: string, shopperLocale?: string): Promise<PaymentMethodsResponse>;

  /**
   * Set payment method on cart
   */
  setPaymentMethod(cartId: string, paymentData: PaymentMethodData): Promise<boolean>;

  /**
   * Place order with the selected payment method
   */
  placeOrder(cartId: string): Promise<PlaceOrderResult>;

  /**
   * Check payment status
   */
  getPaymentStatus(orderNumber: string, cartId: string): Promise<AdyenPaymentStatus>;

  /**
   * Handle additional payment details (3DS, redirects, etc.)
   */
  handleAdditionalDetails(cartId: string, payload: any): Promise<PaymentDetailsResult>;
}

/**
 * Payment Strategy Factory Interface
 */
export interface IPaymentStrategyFactory {
  getStrategy(paymentMethodCode: string): IPaymentStrategy;
}
