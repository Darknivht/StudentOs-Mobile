import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

const BIOMETRIC_ENABLED_KEY = "biometric_lock_enabled";

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  return hasHardware;
}

export async function isBiometricEnrolled(): Promise<boolean> {
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

export async function getBiometricType(): Promise<
  LocalAuthentication.AuthenticationType[]
> {
  return LocalAuthentication.supportedAuthenticationTypesAsync();
}

export async function authenticateWithBiometrics(
  reason: string = "Unlock StudentOS",
): Promise<boolean> {
  const available = await isBiometricAvailable();
  const enrolled = await isBiometricEnrolled();

  if (!available || !enrolled) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: reason,
    fallbackLabel: "Use PIN",
    cancelLabel: "Cancel",
    disableDeviceFallback: true,
  });

  return result.success;
}

export async function isBiometricLockEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
  return value === "true";
}

export async function setBiometricLockEnabled(enabled: boolean): Promise<void> {
  if (enabled) {
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, "true");
  } else {
    await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
  }
}
