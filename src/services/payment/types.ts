export type PaymentProviderType = 'paystack' | 'flutterwave';

export interface PaymentProviderConfig {
  provider: PaymentProviderType;
  publicKey: string;
  environment?: 'test' | 'live';
}

export interface PaymentTransaction {
  amount: number;
  email: string;
  currency: string;
  reference?: string;
  plan?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentResult {
  success: boolean;
  reference: string;
  message?: string;
}

export interface PaymentProvider {
  readonly name: string;
  initializeTransaction(transaction: PaymentTransaction): Promise<{ accessCode: string; reference: string }>;
  verifyPayment(reference: string): Promise<PaymentResult>;
}