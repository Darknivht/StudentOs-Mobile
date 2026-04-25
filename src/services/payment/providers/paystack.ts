import type { PaymentProvider, PaymentTransaction, PaymentResult, PaymentProviderConfig } from '../types';

export class PaystackProvider implements PaymentProvider {
  name = 'paystack';
  private publicKey: string;
  private environment: 'test' | 'live';

  constructor(config: PaymentProviderConfig) {
    this.publicKey = config.publicKey;
    this.environment = config.environment || 'test';
  }

  async initializeTransaction(transaction: PaymentTransaction): Promise<{ accessCode: string; reference: string }> {
    // In production, this would call a backend endpoint
    // Per PITFALL-03: Never expose API keys in the client
    const reference = transaction.reference || `txn_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    
    return {
      accessCode: `pay_${reference}`,
      reference,
    };
  }

  async verifyPayment(reference: string): Promise<PaymentResult> {
    // In production, this would call a backend endpoint
    // Per PITFALL-03: Never expose API keys in the client
    return {
      success: false,
      reference,
      message: 'Payment verification requires backend endpoint',
    };
  }
}