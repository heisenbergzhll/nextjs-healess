// Adyen Payment Types

/**
 * Adyen Payment Method Codes
 * These are the Adobe Commerce payment method codes for Adyen integration
 */
export const ADYEN_PAYMENT_METHODS = {
  CREDIT_CARD: 'adyen_cc',
  HPP: 'adyen_hpp',
  ONE_CLICK: 'adyen_oneclick',
};

export type AdyenPaymentMethodCode = typeof ADYEN_PAYMENT_METHODS[keyof typeof ADYEN_PAYMENT_METHODS];

export interface AdyenConfiguration {
  environment: 'test' | 'live';
  clientKey: string;
  locale?: string;
  countryCode?: string;
  amount?: {
    value: number;
    currency: string;
  };
  paymentMethodsConfiguration?: {
    card?: {
      hasHolderName?: boolean;
      holderNameRequired?: boolean;
      billingAddressRequired?: boolean;
    };
    threeDS2?: {
      challengeWindowSize?: string;
    };
  };
}

export interface AdyenPaymentSession {
  session_data: string;
  payment_methods_response: string;
  client_key: string;
  environment: 'test' | 'live';
}

export interface AdyenPaymentMethodsResponse {
  paymentMethods: AdyenPaymentMethod[];
  storedPaymentMethods?: AdyenStoredPaymentMethod[];
}

export interface AdyenPaymentMethod {
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
}

export interface AdyenStoredPaymentMethod {
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
}

export interface AdyenPaymentState {
  data: {
    paymentMethod: any;
    browserInfo?: any;
    billingAddress?: any;
    deliveryAddress?: any;
    shopperName?: any;
    shopperEmail?: string;
    telephoneNumber?: string;
    storePaymentMethod?: boolean;
  };
}

export interface AdyenPaymentResult {
  resultCode: string;
  action?: AdyenAction;
  order?: {
    orderData: string;
    pspReference: string;
  };
  merchantReference?: string;
  pspReference?: string;
  refusalReason?: string;
  refusalReasonCode?: string;
}

export interface AdyenAction {
  type: string;
  paymentMethodType?: string;
  url?: string;
  method?: string;
  paymentData?: string;
  token?: string;
  subtype?: string;
  qrCodeData?: string;
  [key: string]: any;
}

export interface AdyenPaymentStatus {
  is_final: boolean;
  result_code: string;
  action?: AdyenAction;
  additional_data?: Record<string, any>;
  order_number?: string;
}

export interface AdyenCheckoutInstance {
  create: (type: string, configuration?: any) => AdyenUIElement;
  createFromAction: (action: AdyenAction, configuration?: any) => AdyenUIElement;
  update: (configuration: Partial<AdyenConfiguration>) => void;
}

export interface AdyenUIElement {
  mount: (selector: string | HTMLElement) => void;
  unmount: () => void;
  update: (configuration: any) => void;
  isAvailable: () => Promise<any>;
  handleAction: (action: AdyenAction) => void;
  setStatus: (status: 'loading' | 'success' | 'error' | 'ready', options?: { message?: string }) => void;
}

export interface AdyenCheckoutCallbacks {
  onSubmit?: (state: AdyenPaymentState, component?: AdyenUIElement, actions?: any) => void;
  onAdditionalDetails?: (state: any, component?: AdyenUIElement, actions?: any) => void;
  onPaymentCompleted?: (result: AdyenPaymentResult, component?: AdyenUIElement) => void;
  onPaymentFailed?: (result: AdyenPaymentResult, component?: AdyenUIElement) => void;
  onError?: (error: AdyenError, component?: AdyenUIElement) => void;
  onChange?: (state: AdyenPaymentState, component?: AdyenUIElement) => void;
}

export interface AdyenError {
  name: string;
  message: string;
  errorCode?: string;
  stack?: string;
}

export interface AdyenCheckoutOptions extends AdyenConfiguration {
  session?: {
    id: string;
    sessionData: string;
  };
  paymentMethodsResponse?: AdyenPaymentMethodsResponse;
  analytics?: {
    enabled: boolean;
  };
  onSubmit?: (state: AdyenPaymentState, component?: AdyenUIElement, actions?: any) => void;
  onAdditionalDetails?: (state: any, component?: AdyenUIElement, actions?: any) => void;
  onPaymentCompleted?: (result: AdyenPaymentResult, component?: AdyenUIElement) => void;
  onPaymentFailed?: (result: AdyenPaymentResult, component?: AdyenUIElement) => void;
  onError?: (error: AdyenError, component?: AdyenUIElement) => void;
  onChange?: (state: AdyenPaymentState, component?: AdyenUIElement) => void;
}

// Window type extension for Adyen
declare global {
  interface Window {
    AdyenCheckout?: (options: AdyenCheckoutOptions) => Promise<AdyenCheckoutInstance>;
  }
}

export type AdyenResultCode =
  | 'Authorised'
  | 'Refused'
  | 'Cancelled'
  | 'Error'
  | 'Pending'
  | 'Received'
  | 'RedirectShopper'
  | 'IdentifyShopper'
  | 'ChallengeShopper'
  | 'PresentToShopper';

export interface AdyenPaymentProps {
  cartId: string;
  selectedPaymentCode: string; // Adobe Commerce payment code (e.g., 'adyen_cc', 'adyen_hpp', 'adyen_oneclick')
  onPaymentSuccess: (orderId: string) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel: () => void;
  onPaymentStateChange?: (inProgress: boolean) => void;
}

export interface UseAdyenPaymentReturn {
  initializePaymentSession: () => Promise<AdyenPaymentSession | null>;
  submitPayment: (stateData: any) => Promise<AdyenPaymentStatus | null>;
  submitAdditionalDetails: (details: any) => Promise<AdyenPaymentStatus | null>;
  refetchPaymentStatus: () => void;
  isProcessing: boolean;
  error: string | null;
  paymentStatus?: AdyenPaymentStatus;
}
