import type { PaymentProvider, PaymentProviderConfig } from './types';
import { PaystackProvider } from './providers/paystack';

export class PaymentProviderFactory {
  private static instance: PaymentProvider | null = null;
  private static config: PaymentProviderConfig | null = null;

  static initialize(config: PaymentProviderConfig): void {
    this.config = config;

    switch (config.provider) {
      case 'paystack':
        this.instance = new PaystackProvider(config);
        break;
      default:
        throw new Error(`Unknown payment provider: ${config.provider}`);
    }
  }

  static getInstance(): PaymentProvider {
    if (!this.instance) {
      throw new Error('PaymentProviderFactory not initialized');
    }
    return this.instance;
  }

  static getConfig(): PaymentProviderConfig | null {
    return this.config;
  }
}