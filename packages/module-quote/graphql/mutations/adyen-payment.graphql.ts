import { gql } from '@apollo/client';

/**
 * Adobe Commerce Headless Adyen Integration - GraphQL Queries
 * Following official Adobe Commerce documentation for headless integration
 * @see https://docs.adyen.com/plugins/adobe-commerce/headless-integration
 */

// Step 1: Get available payment methods
export const GET_ADYEN_PAYMENT_METHODS = gql`
  query GetAdyenPaymentMethods($cartId: String!, $shopperLocale: String) {
    adyenPaymentMethods(cart_id: $cartId, shopper_locale: $shopperLocale) {
      paymentMethodsExtraDetails {
        isOpenInvoice
        type
        configuration {
          currency
          amount {
            currency
            value
          }
        }
        icon {
          height
          url
          width
        }
      }
      paymentMethodsResponse {
        paymentMethods {
          brand
          brands
          name
          type
          configuration {
            gatewayMerchantId
            merchantId
            merchantName
          }
          details {
            key
            optional
            type
            value
            items {
              id
              name
            }
          }
          issuers {
            id
            name
          }
        }
        storedPaymentMethods {
          brand
          expiryMonth
          expiryYear
          holderName
          iban
          id
          lastFour
          name
          networkTxReference
          ownerName
          shopperEmail
          supportedShopperInteractions
          type
        }
      }
    }
  }
`;

// Step 2: Set payment method on cart for Credit Card
export const SET_ADYEN_CC_PAYMENT_METHOD = gql`
  mutation SetAdyenCCPaymentMethod(
    $cartId: String!
    $ccType: String!
    $stateData: String!
    $recurringProcessingModel: String
    $comboCardType: String
    $guestEmail: String
    $numberOfInstallments: Int
    $returnUrl: String
  ) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: "adyen_cc"
          adyen_additional_data_cc: {
            cc_type: $ccType
            stateData: $stateData
            recurringProcessingModel: $recurringProcessingModel
            combo_card_type: $comboCardType
            guestEmail: $guestEmail
            number_of_installments: $numberOfInstallments
            returnUrl: $returnUrl
          }
        }
      }
    ) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Step 2: Set payment method on cart for HPP (Hosted Payment Page) - Alternative Payment Methods
export const SET_ADYEN_HPP_PAYMENT_METHOD = gql`
  mutation SetAdyenHPPPaymentMethod(
    $cartId: String!
    $brandCode: String!
    $stateData: String!
    $recurringProcessingModel: String
    $guestEmail: String
    $returnUrl: String
    $dfValue: String
  ) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: "adyen_hpp"
          adyen_additional_data_hpp: {
            brand_code: $brandCode
            stateData: $stateData
            recurringProcessingModel: $recurringProcessingModel
            guestEmail: $guestEmail
            returnUrl: $returnUrl
            df_value: $dfValue
          }
        }
      }
    ) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Step 2: Set payment method on cart for Oneclick (Stored Payment Methods)
export const SET_ADYEN_ONECLICK_PAYMENT_METHOD = gql`
  mutation SetAdyenOneclickPaymentMethod(
    $cartId: String!
    $stateData: String!
  ) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: "adyen_oneclick"
          adyen_additional_data_oneclick: {
            stateData: $stateData
          }
        }
      }
    ) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Step 2: Set payment method on cart for Alternative Payment Methods (DEPRECATED - use HPP or Oneclick)
export const SET_ADYEN_APM_PAYMENT_METHOD = gql`
  mutation SetAdyenAPMPaymentMethod(
    $cartId: String!
    $paymentCode: String!
    $brandCode: String
    $stateData: String!
    $recurringProcessingModel: String
  ) {
    setPaymentMethodOnCart(
      input: {
        cart_id: $cartId
        payment_method: {
          code: $paymentCode
          adyen_additional_data: {
            brand_code: $brandCode
            stateData: $stateData
            recurringProcessingModel: $recurringProcessingModel
          }
        }
      }
    ) {
      cart {
        id
        selected_payment_method {
          code
          title
        }
      }
    }
  }
`;

// Step 3: Place order using placeAdyenOrder mutation (combines setPaymentMethod + placeOrder)
export const PLACE_ADYEN_ORDER = gql`
  mutation PlaceAdyenOrder(
    $cartId: String!
    $paymentCode: String!
    $stateData: String!
    $ccType: String
    $brandCode: String
    $recurringProcessingModel: String
  ) {
    placeAdyenOrder(
      cart_id: $cartId
      payment_code: $paymentCode
      state_data: $stateData
      cc_type: $ccType
      brand_code: $brandCode
      recurring_processing_model: $recurringProcessingModel
    ) {
      order {
        order_number
        cart_id
        adyen_payment_status {
          isFinal
          resultCode
          additionalData
          action
        }
      }
    }
  }
`;

// Alternative: Traditional two-step approach (setPaymentMethod then placeOrder)
export const PLACE_ORDER_WITH_ADYEN = gql`
  mutation PlaceOrderWithAdyen($cartId: String!) {
    placeOrder(input: { cart_id: $cartId }) {
      order {
        order_number
        cart_id
        adyen_payment_status {
          isFinal
          resultCode
          additionalData
          action
        }
      }
    }
  }
`;

// Step 4: Check payment status
export const GET_ADYEN_PAYMENT_STATUS = gql`
  query GetAdyenPaymentStatus($orderNumber: String!, $cartId: String!) {
    adyenPaymentStatus(orderNumber: $orderNumber, cartId: $cartId) {
      isFinal
      resultCode
      additionalData
      action
    }
  }
`;

export const HANDLE_ADYEN_PAYMENT_DETAILS = gql`
  mutation HandleAdyenPaymentDetails($cartId: String!, $payload: String!) {
    adyenPaymentDetails(cart_id: $cartId, payload: $payload) {
      isFinal
      resultCode
      additionalData
      action
    }
  }
`;

// Legacy session-based approach (for backward compatibility)
export const CREATE_ADYEN_PAYMENT_SESSION = gql`
  mutation CreateAdyenPaymentSession($cartId: String!) {
    createAdyenPaymentSession(cartId: $cartId) {
      session_data
      payment_methods_response
      client_key
      environment
    }
  }
`;
