import * as SecureStore from "expo-secure-store";

const PIN_KEY = "app_pin_hash";
const PIN_FAILED_KEY = "pin_failed_attempts";
const PIN_LOCKOUT_KEY = "pin_lockout_until";

const SALT = "studentos_salt_2026";

/**
 * Simple deterministic hash for PIN storage.
 * crypto.subtle is not available in Hermes (React Native JS engine).
 * SecureStore provides the actual security boundary — this hash just
 * prevents storing the raw PIN in plaintext.
 */
function hashPin(pin: string): string {
  const input = pin + SALT;
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    hash = ((hash << 5) + hash) ^ input.charCodeAt(i);
    hash = hash & hash; // Force 32-bit integer
  }
  // Produce a fixed-length hex string
  return (hash >>> 0).toString(16).padStart(8, "0") +
    Math.abs(input.length * 0x9e3779b9 | 0).toString(16).padStart(8, "0");
}

export async function setPin(pin: string): Promise<void> {
  const hash = hashPin(pin);
  await SecureStore.setItemAsync(PIN_KEY, hash);
  await SecureStore.setItemAsync(PIN_FAILED_KEY, "0");
}

export async function verifyPin(pin: string): Promise<boolean> {
  const lockoutUntil = await SecureStore.getItemAsync(PIN_LOCKOUT_KEY);
  if (lockoutUntil) {
    const lockoutTime = parseInt(lockoutUntil, 10);
    if (Date.now() < lockoutTime) {
      return false;
    }
    await SecureStore.deleteItemAsync(PIN_LOCKOUT_KEY);
    await SecureStore.setItemAsync(PIN_FAILED_KEY, "0");
  }

  const storedHash = await SecureStore.getItemAsync(PIN_KEY);
  if (!storedHash) return false;

  const inputHash = hashPin(pin);
  if (inputHash === storedHash) {
    await SecureStore.setItemAsync(PIN_FAILED_KEY, "0");
    return true;
  }

  const failed =
    parseInt((await SecureStore.getItemAsync(PIN_FAILED_KEY)) || "0", 10) + 1;
  await SecureStore.setItemAsync(PIN_FAILED_KEY, failed.toString());

  if (failed >= 5) {
    const lockoutMs = Math.min(
      30000 * Math.pow(2, Math.floor((failed - 5) / 5)),
      300000,
    );
    await SecureStore.setItemAsync(
      PIN_LOCKOUT_KEY,
      (Date.now() + lockoutMs).toString(),
    );
  }

  return false;
}

export async function isPinSet(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(PIN_KEY);
  return hash !== null;
}

export async function removePin(): Promise<void> {
  await SecureStore.deleteItemAsync(PIN_KEY);
  await SecureStore.deleteItemAsync(PIN_FAILED_KEY);
  await SecureStore.deleteItemAsync(PIN_LOCKOUT_KEY);
}

export async function getPinLockoutRemaining(): Promise<number> {
  const lockoutUntil = await SecureStore.getItemAsync(PIN_LOCKOUT_KEY);
  if (!lockoutUntil) return 0;
  return Math.max(0, parseInt(lockoutUntil, 10) - Date.now());
}

export async function getFailedPinAttempts(): Promise<number> {
  const val = await SecureStore.getItemAsync(PIN_FAILED_KEY);
  return parseInt(val || "0", 10);
}
