// Adyen Helper Functions - Version: 2026-02-16-v2
// Last updated: Google Pay now shows on ALL devices (iOS, Android, Desktop)

import { ADYEN_PAYMENT_METHODS } from '@voguish/module-quote/types/adyen.types';


export const ADYEN_RESULT_CODES = {
  AUTHORISED: 'Authorised',
  REFUSED: 'Refused',
  CANCELLED: 'Cancelled',
  ERROR: 'Error',
  PENDING: 'Pending',
  RECEIVED: 'Received',
  REDIRECT_SHOPPER: 'RedirectShopper',
  IDENTIFY_SHOPPER: 'IdentifyShopper',
  CHALLENGE_SHOPPER: 'ChallengeShopper',
  PRESENT_TO_SHOPPER: 'PresentToShopper'
} as const;

export type AdyenResultCode = typeof ADYEN_RESULT_CODES[keyof typeof ADYEN_RESULT_CODES];

export const isSuccessfulPayment = (resultCode: string): boolean => {
  return resultCode === ADYEN_RESULT_CODES.AUTHORISED ||
    resultCode === ADYEN_RESULT_CODES.RECEIVED ||
    resultCode === ADYEN_RESULT_CODES.PENDING;
};

export const isFailedPayment = (resultCode: string): boolean => {
  return resultCode === ADYEN_RESULT_CODES.REFUSED ||
    resultCode === ADYEN_RESULT_CODES.CANCELLED ||
    resultCode === ADYEN_RESULT_CODES.ERROR;
};

export const requiresAction = (resultCode: string): boolean => {
  return resultCode === ADYEN_RESULT_CODES.REDIRECT_SHOPPER ||
    resultCode === ADYEN_RESULT_CODES.IDENTIFY_SHOPPER ||
    resultCode === ADYEN_RESULT_CODES.CHALLENGE_SHOPPER ||
    resultCode === ADYEN_RESULT_CODES.PRESENT_TO_SHOPPER;
};

export const getPaymentResultMessage = (resultCode: string): string => {
  switch (resultCode) {
    case ADYEN_RESULT_CODES.AUTHORISED:
      return 'Payment successful';
    case ADYEN_RESULT_CODES.REFUSED:
      return 'Payment refused. Please try another payment method.';
    case ADYEN_RESULT_CODES.CANCELLED:
      return 'Payment cancelled';
    case ADYEN_RESULT_CODES.ERROR:
      return 'Payment error occurred';
    case ADYEN_RESULT_CODES.PENDING:
      return 'Payment is being processed';
    case ADYEN_RESULT_CODES.RECEIVED:
      return 'Payment received and will be processed';
    default:
      return 'Unknown payment status';
  }
};

export const sanitizeAdyenError = (error: any): string => {
  if (typeof error === 'string') {
    return error;
  }

  if (error?.message) {
    return error.message;
  }

  if (error?.errorCode) {
    return `Payment error: ${error.errorCode}`;
  }

  return 'An unexpected payment error occurred';
};

export const loadAdyenScript = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (typeof window !== 'undefined' && (window as any).AdyenCheckout) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/5.50.0/adyen.js';
    // Add a valid integrity hash before enabling SRI in production.
    script.crossOrigin = 'anonymous';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Adyen SDK'));
    document.head.appendChild(script);

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://checkoutshopper-live.adyen.com/checkoutshopper/sdk/5.50.0/adyen.css';
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

export const getAdyenEnvironment = (): 'test' | 'live' => {
  const env = process.env.NEXT_PUBLIC_ADYEN_ENVIRONMENT;
  return env === 'live' ? 'live' : 'test';
};

export const getAdyenClientKey = (): string => {
  return process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY || '';
};

export const validateAdyenConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_ADYEN_CLIENT_KEY) {
    errors.push('NEXT_PUBLIC_ADYEN_CLIENT_KEY is not configured');
  }

  if (!process.env.NEXT_PUBLIC_ADYEN_ENVIRONMENT) {
    errors.push('NEXT_PUBLIC_ADYEN_ENVIRONMENT is not configured');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Map Adyen card brand to Adobe Commerce card type
 */
export const mapAdyenBrandToCardType = (brand: string): string => {
  const brandMap: Record<string, string> = {
    'visa': 'VI',
    'mc': 'MC',
    'mastercard': 'MC',
    'amex': 'AE',
    'discover': 'DI',
    'jcb': 'JCB',
    'diners': 'DN',
    'maestro': 'SM',
    'bcmc': 'BC',
    'cartebancaire': 'CB',
    'elo': 'ELO',
    'hipercard': 'HC',
  };

  return brandMap[brand?.toLowerCase()] || 'VI';
};

/**
 * Check if payment method is a card payment
 */
export const isCardPaymentMethod = (code: string): boolean => {
  return code === ADYEN_PAYMENT_METHODS.CREDIT_CARD || code === ADYEN_PAYMENT_METHODS.ONE_CLICK;
};

/**
 * Check if payment method is an alternative payment method
 */
export const isAlternativePaymentMethod = (code: string): boolean => {
  return code.startsWith('adyen_') && !isCardPaymentMethod(code);
};

/**
 * Get payment method type from code
 */
export const getPaymentMethodType = (code: string): string => {
  return code.replace('adyen_', '');
};

/**
 * Extract order number from various response formats
 */
export const extractOrderNumber = (response: any): string | null => {
  return (
    response?.order_number ||
    response?.orderNumber ||
    response?.order?.order_number ||
    response?.merchantReference ||
    null
  );
};

/**
 * Parse payment method icon details
 */
export const parsePaymentMethodIcon = (icon: any): {
  url: string;
  width: number;
  height: number;
} | null => {
  if (!icon || !icon.url) {
    return null;
  }

  return {
    url: icon.url,
    width: icon.width || 40,
    height: icon.height || 26,
  };
};

/**
 * Build return URL for payment redirects
 */
export const buildReturnUrl = (path: string = '/checkout/payment/return'): string => {
  if (typeof window === 'undefined') {
    return path;
  }

  return `${window.location.origin}${path}`;
};

/**
 * Sanitize state data for logging (remove sensitive info)
 */
export const sanitizeStateData = (stateData: any): any => {
  if (!stateData) return null;

  const sanitized = { ...stateData };

  // Remove encrypted card data
  if (sanitized.paymentMethod) {
    const pm = { ...sanitized.paymentMethod };
    delete pm.encryptedCardNumber;
    delete pm.encryptedExpiryMonth;
    delete pm.encryptedExpiryYear;
    delete pm.encryptedSecurityCode;
    sanitized.paymentMethod = pm;
  }

  return sanitized;
};

/**
 * Wallet Payment Component Configuration
 */
export interface WalletPaymentConfig {
  merchantId?: string;
  merchantName?: string;
  gatewayMerchantId?: string;
}

export interface WalletPaymentAmount {
  value: number;
  currency: string;
}

/**
 * Helper function to create and mount wallet payment components
 * Follows official Adyen documentation for Google Pay and Apple Pay
 * Implements production-ready configuration with proper error handling
 * 
 * @param type - Payment method type ('googlepay' or 'applepay')
 * @param config - Merchant configuration from backend
 * @param ComponentClass - Adyen component class (GooglePay or ApplePay)
 * @param checkout - Adyen Checkout instance
 * @param paymentAmount - Payment amount with currency
 * @param countryCode - Country code for the payment
 * @param environment - Adyen environment ('test' or 'live')
 * @param container - Parent container to append the payment component
 * @returns Cleanup function or null if not available
 * 
 * @see https://docs.adyen.com/payment-methods/google-pay/web-component
 * @see https://docs.adyen.com/payment-methods/apple-pay/web-component
 */
export const createWalletPayment = async (
  type: 'googlepay' | 'applepay',
  config: WalletPaymentConfig | null | undefined,
  ComponentClass: any,
  checkout: any,
  paymentAmount: WalletPaymentAmount,
  countryCode: string,
  environment: 'test' | 'live',
  container: HTMLElement
): Promise<(() => void) | null> => {
  if (!config) {
    console.log(`[Adyen] ${type} configuration not available, skipping`);
    return null;
  }

  let component: any = null;
  let containerDiv: HTMLDivElement | null = null;

  try {
    const componentConfig: any = {
      amount: paymentAmount,
      countryCode,
    };

    /* ---------------- GOOGLE PAY CONFIGURATION ---------------- */
    if (type === 'googlepay') {
      componentConfig.environment = environment === 'live' ? 'PRODUCTION' : 'TEST';
      console.log("merchant====", process.env.NEXT_PUBLIC_ADYEN_MERCHANT_ACCOUNT)
      // Merchant configuration — only set what's available from backend
      if (config.merchantName) {
        componentConfig.merchantName = config.merchantName;
      }
      if (config.gatewayMerchantId) {
        componentConfig.gatewayMerchantId = config.gatewayMerchantId;
      }
      // merchantId is only required in production
      //todo : do in live
      if (environment === 'test' && config.merchantId) {
        componentConfig.merchantId = config.merchantId;
      }

      // Google Pay button styling
      componentConfig.buttonType = 'pay';
      componentConfig.buttonSizeMode = 'fill';
    }

    /* ---- APPLE PAY ---- */
    if (type === 'applepay') {
      // Apple Pay gets most of its config from Adyen's backend automatically.
      if (config.merchantId) {
        componentConfig.merchantId = config.merchantId;
      }
      if (config.merchantName) {
        componentConfig.merchantName = config.merchantName;
      }

      // Button styling only
      componentConfig.buttonType = 'plain';
      componentConfig.buttonColor = 'black';
    }

    // Create component instance
    component = new ComponentClass(checkout, componentConfig);
    //TODO: Please check this , it is important in Production
    // Check availability BEFORE mounting — this is critical for Apple Pay.
    // Apple Pay will fail with "Could not get Apple Pay session" if the
    // device/browser doesn't support it or the merchant domain isn't verified.
    // try {
    //   const available = await component.isAvailable();
    //   if (!available) {
    //     console.log(`[Adyen] ${type} is not available on this device/browser`);
    //     return null;
    //   }
    // } catch (availErr) {
    //   // isAvailable() rejection means not supported — this is expected on
    //   // non-Apple devices or when merchant domain isn't verified
    //   console.log(`[Adyen] ${type} not supported in this environment:`, availErr);
    //   return null;
    // }

    // Create container div and mount
    containerDiv = document.createElement('div');
    containerDiv.id = `${type}-container`;
    containerDiv.className = `adyen-${type}-wrapper`;
    container.appendChild(containerDiv);

    component.mount(containerDiv);
    console.log(`[Adyen] ${type} mounted successfully`);

    // Return cleanup handler
    return () => {
      try {
        component?.unmount?.();
        containerDiv?.remove();
      } catch (e) {
        // Silently handle cleanup errors
      }
    };
  } catch (err) {
    console.warn(`[Adyen] ${type} initialization failed:`, err);
    containerDiv?.remove();
    return null;
  }
};

/**
 * Extract wallet payment configuration from payment methods response
 * @param paymentMethods - Array of payment methods from Adyen
 * @param type - Wallet type ('googlepay' or 'applepay')
 * @returns Wallet configuration or null
 */
export const extractWalletConfig = (
  paymentMethods: any[],
  type: 'googlepay' | 'applepay'
): WalletPaymentConfig | null => {
  const method = paymentMethods.find((pm: any) => pm.type === type);
  const config = method?.configuration || null;

  return config;
};

/**
 * Device Detection Helpers for Wallet Payments
 */

/**
 * Detect if the device is running iOS
 * @returns true if iOS device (iPhone, iPad, iPod)
 */
export const isIOSDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Detect if the device is running Android
 * @returns true if Android device
 */
export const isAndroidDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /android/.test(userAgent);
};

/**
 * Detect if the device is running macOS (for Apple Pay on desktop)
 * @returns true if macOS device
 */
export const isMacOS = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) return false;

  const userAgent = window.navigator.userAgent.toLowerCase();
  return /macintosh|mac os x/.test(userAgent);
};

/**
 * Check if Apple Pay should be shown based on device
 * @returns true if device supports Apple Pay (iOS or macOS with Safari)
 */
export const shouldShowApplePay = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Check if it's iOS or macOS
  const isAppleDevice = isIOSDevice() || isMacOS();

  // Apple Pay is only available on Safari
  const isSafari = /^((?!chrome|android).)*safari/i.test(window.navigator.userAgent);

  const result = isAppleDevice && isSafari;

  return result;
};

/**
 * Check if Google Pay should be shown based on device
 * Google Pay works on most devices and browsers (Android, iOS, Desktop)
 * @returns true - Google Pay is available on all platforms
 */
export const shouldShowGooglePay = (): boolean => {
  if (typeof window === 'undefined') {
    return false;
  }

  // Google Pay works on Android, iOS, and desktop browsers
  return true;
};

/**
 * Get the preferred wallet payment method based on device
 * @returns 'applepay', 'googlepay', or 'both'
 */
export const getPreferredWalletMethod = (): 'applepay' | 'googlepay' | 'both' => {

  const showApplePay = shouldShowApplePay();
  const showGooglePay = shouldShowGooglePay();


  // iOS devices: Show both Google Pay and Apple Pay
  if (showApplePay && showGooglePay) {
    return 'both';
  }

  // Apple devices without Safari or non-Apple devices: Show only Google Pay
  if (showGooglePay && !showApplePay) {
    return 'googlepay';
  }

  return 'googlepay';
};

/**
 * Map store locale to Adyen supported locale
 * Adyen supports specific locales - this prevents 404 errors for translation files
 * 
 * Note: Adyen doesn't have separate en-GB translations, so we keep en-GB as-is
 * and Adyen will fall back to English defaults. The 404 error is harmless.
 * 
 * @see https://docs.adyen.com/online-payments/web-components/localization-components
 */
export const getAdyenSupportedLocale = (storeLocale: string): string => {
  // Convert underscore to hyphen (en_US -> en-US)
  const locale = storeLocale.replace('_', '-');

  // Map of store locales to Adyen supported locales
  const localeMap: Record<string, string> = {
    'en-US': 'en-US',
    'en-GB': 'en-US',
    'en-CA': 'en-US',
    'en-AU': 'en-US',
    'es-ES': 'es-ES',
    'es-MX': 'es-ES',
    'fr-FR': 'fr-FR',
    'fr-CA': 'fr-FR',
    'de-DE': 'de-DE',
    'it-IT': 'it-IT',
    'nl-NL': 'nl-NL',
    'pt-BR': 'pt-BR',
    'pt-PT': 'pt-BR',
    'ja-JP': 'ja-JP',
    'zh-CN': 'zh-CN',
    'zh-TW': 'zh-TW',
    'ko-KR': 'ko-KR',
    'ar-SA': 'ar',
    'ar-AE': 'ar',
  };

  // Return mapped locale or keep original
  return localeMap[locale] || locale;
};

/**
 * Get amount for Adyen API with proper currency conversion
 * Uses the same currency conversion logic as getFormattedPrice
 * Converts to minor units (cents) as required by Adyen API
 * 
 * @param quote - Cart quote object from Redux
 * @returns Amount object with value in minor units and currency code only
 * 
 * @example
 * ```typescript
 * const amount = getAdyenAmount(quote);
 * // Returns: { value: 1567, currency: 'USD' } for $15.67
 * ```
 */
export const getAdyenAmount = (quote: any) => {
  // Import getKeyFromStorage dynamically to avoid circular dependencies
  const getKeyFromStorage = (key: string, needParsed: boolean = false) => {
    if (typeof window === 'undefined') return null;
    const data = localStorage.getItem(key);
    if (!data) return null;
    if (needParsed) {
      try {
        return JSON.parse(data);
      } catch (e) {
        console.warn(`[Adyen] Failed to parse localStorage key "${key}":`, e);
        return null;
      }
    }
    return data;
  };

  const currencySelected = getKeyFromStorage('current_currency', true);
  const baseValue = quote?.prices?.grand_total?.value || 0;
  const baseCurrency = quote?.prices?.grand_total?.currency || 'USD';

  let targetCurrency = currencySelected?.currency_to ?? baseCurrency;

  if (targetCurrency && typeof targetCurrency === 'string') {
    const match = targetCurrency.match(/[A-Z]{3}/);
    if (match) {
      targetCurrency = match[0];
    } else {
      targetCurrency = targetCurrency.toUpperCase().replace(/[^A-Z]/g, '').substring(0, 3);
    }

    if (targetCurrency.length !== 3) {
      targetCurrency = baseCurrency;
    }
  }

  // Convert price if needed (same logic as getFormattedPrice)
  let convertedValue = baseValue;
  if (baseCurrency !== currencySelected?.currency_to) {
    convertedValue = baseValue * Number(currencySelected?.rate ?? 1);
  }

  return {
    value: Math.round(convertedValue * 100),
    currency: targetCurrency || 'USD',
  };
};
