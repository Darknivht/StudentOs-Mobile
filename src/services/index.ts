export { supabase } from "./supabase/client";
export { AIProviderFactory } from "./ai/providerFactory";
export type {
  AIProvider,
  AIMessage,
  AIProviderConfig,
  AIStreamingOptions,
} from "./ai/types";
export { PaymentProviderFactory } from "./payment/providerFactory";
export type {
  PaymentProvider,
  PaymentTransaction,
  PaymentResult,
  PaymentProviderConfig,
} from "./payment/types";
export {
  signUp,
  signIn,
  signOut,
  resetPassword,
  getSession,
  fetchUserProfile,
  onAuthStateChange,
} from "./supabase/authService";
export {
  isBiometricAvailable,
  isBiometricEnrolled,
  getBiometricType,
  authenticateWithBiometrics,
  isBiometricLockEnabled,
  setBiometricLockEnabled,
} from "./auth/biometricService";
export {
  setPin,
  verifyPin,
  isPinSet,
  removePin,
  getPinLockoutRemaining,
  getFailedPinAttempts,
} from "./auth/pinService";
