export { supabase } from './supabase/client';
export { AIProviderFactory } from './ai/providerFactory';
export type { AIProvider, AIMessage, AIProviderConfig, AIStreamingOptions } from './ai/types';
export { PaymentProviderFactory } from './payment/providerFactory';
export type { PaymentProvider, PaymentTransaction, PaymentResult, PaymentProviderConfig } from './payment/types';