import { ApolloQueryResult, OperationVariables } from '@apollo/client';
import { ReactNode } from 'react';
import {
  AvailablePaymentMethods,
  AvailableShippingMethod,
  CartAddressInterface,
  CartInterface,
  SelectedPaymentMethod,
  SelectedShippingMethod,
} from './cart-types';

export type CheckoutStepTabs =
  | 'DETAILS'
  | 'SHIPPING-ADDRESS'
  | 'SHIPPING-METHOD'
  | 'BILLING-ADDRESS'
  | 'PAYMENT'
  | 'REVIEW-ORDER';

export type CheckoutStep = {
  index: CheckoutStepTabs;
  label: string;
  content: ReactNode;
};

export interface CheckoutStepProps {
  cartId: string;
  handleNext: () => void;
  handlePrev: () => void;
  isAccountLoggedIn: boolean;
}

export interface CheckoutStepEmail extends CheckoutStepProps {
  email: string;
}
export interface CheckoutStepShipAddress extends CheckoutStepProps {
  addresses: any;
  token: string;
  selectedShippingAddress: CartAddressInput;
  loading: boolean;
  refetchAddress: (
    variables?: Partial<OperationVariables> | undefined //eslint-disable-line
  ) => Promise<ApolloQueryResult<any>>;
}
export interface CheckoutStepShipMethods extends CheckoutStepProps {
  token: string;
  availableShippingMethods: AvailableShippingMethod[];
  selectedShippingMethod: SelectedShippingMethod;
}

export interface CheckoutStepBillAddress extends CheckoutStepProps {
  selectedBillingAddress: CartAddressInput;
  selectedShippingAddress: CartAddressInput;
  addresses: any;
}

export interface CheckoutStepPayment extends CheckoutStepProps {
  availablePaymentMethods: AvailablePaymentMethods[];
  selectedPaymentMethod: SelectedPaymentMethod;
  token: string;
  selectedShippingMethod?: SelectedShippingMethod;
  selectedShippingAddress?: CartAddressInterface;
  selectedBillingAddress?: CartAddressInterface;
  isVirtual?: boolean;
}
export interface CheckoutStepReview extends CheckoutStepProps {
  selectedShippingAddress: CartAddressInterface;
  selectedShippingMethod: SelectedShippingMethod;
  selectedPaymentMethod: SelectedPaymentMethod;
  token: string;
  selectedBillingAddress: CartAddressInterface;
  isVirtual?: boolean;
}

export interface CartAddressInput {
  city: string;
  company?: string;
  country_code: string;
  firstname: string;
  lastname: string;
  postcode: string;
  region?: string;
  region_id?: number;
  save_in_address_book: boolean;
  street: string[];
  telephone: string;
}

export interface ShippingAddressInput {
  address?: CartAddressInput;
  customer_address_id?: number;
  customer_notes?: string;
  pickup_location_code?: string;
  id?: number;
}

export interface SetShippingAddressesOnCartInput {
  cartId: string;
  shippingAddresses: ShippingAddressInput[];
}

export interface ShippingMethodInput {
  carrier_code: string;
  method_code: string;
}

export interface SetShippingMethodsOnCartInput {
  cartId: string;
  shippingMethods: ShippingMethodInput[];
}

export interface PaymentMethodInput {
  code: string;
}

export interface SetPaymentMethodOnCartInput {
  cartId: string;
  paymentMethod: PaymentMethodInput;
}

export interface SetShippingAddressesOnCartOutput {
  setShippingAddressesOnCart: {
    cart: CartInterface;
  };
}

export interface SetShippingMethodsOnCartOutput {
  setShippingMethodsOnCart: {
    cart: CartInterface;
  };
}

export interface SetPaymentMethodOnCartOutput {
  setPaymentMethodOnCart: {
    cart: CartInterface;
  };
}

export interface BillingAddressInput {
  address?: CartAddressInput;
  customer_address_id?: number;
  same_as_shipping?: boolean;
  use_for_shipping?: boolean;
}

export interface SetBillingAddressOnCartInput {
  cartId: string;
  billingAddress: BillingAddressInput;
}

export interface SetBillingAddressesOnCartOutput {
  setBillingAddressOnCart: {
    cart: CartInterface;
  };
}

export interface CreateNihaopayTokenInput {
  terminal: number;
  return_url: string;
  cart_id: string;
}

export interface CreatePaypalTokenInput {
  cart_id: string;
  code: string;
  express_button: boolean;
  cancel_url: string;
  return_url: string;
}

export interface SetPayPalPaymentMethodOnCartInput {
  cart_id: string;
  code: string;
  payer_id: string;
  token: string;
}

export interface PlaceOrderFromAdyenInput {
  cart_id: string;
  code: string;
  cc_type: string;
  return_url: string;
  guestEmail?: string;
  stateData: string;
}

export interface AdyenOrder {
  order_number: string;
  cart_id: string;
  adyen_payment_status: AydenPayResultDataType;
}

export type AydenPayResultDataType = {
  isFinal: boolean;
  resultCode: string;
  additionalData: any;
  action: any;
};
export interface AdyenPaymentState {
  adyenPaymentDetails: AydenPayResultDataType,
  error: string | null,
}

