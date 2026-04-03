/**
 * Payment Strategy Factory
 * Creates appropriate payment strategy based on payment method code
 */

import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { IPaymentStrategy, IPaymentStrategyFactory } from './PaymentStrategy.interface';
import { AdyenPaymentStrategy } from './AdyenPaymentStrategy';

export class PaymentStrategyFactory implements IPaymentStrategyFactory {
  private strategies: Map<string, IPaymentStrategy> = new Map();

  constructor(
    private apolloClient: ApolloClient<NormalizedCacheObject>,
    private token?: string | null,
    private storeCode?: string | null
  ) {
    this.initializeStrategies();
  }

  /**
   * Initialize available payment strategies
   */
  private initializeStrategies(): void {
    // Adyen strategy handles all Adyen payment methods
    const adyenStrategy = new AdyenPaymentStrategy(this.apolloClient, this.token, this.storeCode);

    // Register Adyen payment methods
    const adyenMethods = [
      'adyen_cc',
      'adyen_oneclick',
      'adyen_hpp',
    ];

    adyenMethods.forEach(method => {
      this.strategies.set(method, adyenStrategy);
    });
  }

  /**
   * Get payment strategy for a specific payment method
   */
  getStrategy(paymentMethodCode: string): IPaymentStrategy {
    const strategy = this.strategies.get(paymentMethodCode);

    if (!strategy) {
      throw new Error(`No payment strategy found for method: ${paymentMethodCode}`);
    }

    return strategy;
  }

  /**
   * Check if a payment method is supported
   */
  isSupported(paymentMethodCode: string): boolean {
    return this.strategies.has(paymentMethodCode);
  }

  /**
   * Get all supported payment method codes
   */
  getSupportedMethods(): string[] {
    return Array.from(this.strategies.keys());
  }

  /**
   * Register a custom payment strategy
   */
  registerStrategy(paymentMethodCode: string, strategy: IPaymentStrategy): void {
    this.strategies.set(paymentMethodCode, strategy);
  }
}
