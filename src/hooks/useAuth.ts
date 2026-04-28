import { useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "../stores/authStore";
import {
  signUp as signUpService,
  signIn as signInService,
  signOut as signOutService,
  resetPassword as resetPasswordService,
  getSession,
  fetchUserProfile,
  onAuthStateChange,
  isBiometricAvailable,
  isBiometricEnrolled,
  authenticateWithBiometrics,
  isBiometricLockEnabled,
  isPinSet as checkPinSet,
  verifyPin as verifyPinService,
} from "../services";

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const isBlocked = useAuthStore((s) => s.isBlocked);
  const isLocked = useAuthStore((s) => s.isLocked);
  const biometricEnabled = useAuthStore((s) => s.biometricEnabled);
  const pinSet = useAuthStore((s) => s.pinSet);
  const subscription = useAuthStore((s) => s.subscription);
  const store = useAuthStore();

  const initializedRef = useRef(false);

  const initialize = useCallback(async () => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    try {
      store.setLoading(true);

      const session = await getSession();
      if (session?.user) {
        const profile = await fetchUserProfile(session.user.id);
        if (profile) {
          store.setUser(profile);
          if (profile.isBlocked) {
            await signOutService();
            store.signOut();
            return;
          }
        }

        const biometricAvail = await isBiometricAvailable();
        const biometricEnrolled = await isBiometricEnrolled();
        const biometricEnabled = await isBiometricLockEnabled();
        const pinIsSet = await checkPinSet();

        store.setBiometricEnabled(
          biometricAvail && biometricEnrolled && biometricEnabled,
        );
        store.setPinSet(pinIsSet);

        const needsLock =
          (biometricAvail && biometricEnrolled && biometricEnabled) || pinIsSet;
        store.setLocked(needsLock);
      } else {
        store.setUser(null);
        store.setLocked(false);
      }
    } catch (error) {
      console.error("Auth initialization failed:", error);
      store.setUser(null);
    } finally {
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();

    const { data } = onAuthStateChange(async (event, userId) => {
      if (event === "SIGNED_IN" && userId) {
        const profile = await fetchUserProfile(userId);
        if (profile) {
          if (profile.isBlocked) {
            await signOutService();
            store.signOut();
            return;
          }
          store.setUser(profile);

          const biometricAvail = await isBiometricAvailable();
          const biometricEnrolled = await isBiometricEnrolled();
          const biometricEnabled = await isBiometricLockEnabled();
          const pinIsSet = await checkPinSet();

          store.setBiometricEnabled(
            biometricAvail && biometricEnrolled && biometricEnabled,
          );
          store.setPinSet(pinIsSet);

          const needsLock =
            (biometricAvail && biometricEnrolled && biometricEnabled) ||
            pinIsSet;
          store.setLocked(needsLock);
        }
      } else if (event === "SIGNED_OUT") {
        store.signOut();
      }
    });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && isAuthenticated) {
        if (biometricEnabled || pinSet) {
          store.setLocked(true);
        }
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, biometricEnabled, pinSet]);

  const signUp = useCallback(async (email: string, password: string) => {
    store.setLoading(true);
    try {
      await signUpService(email, password);
    } finally {
      store.setLoading(false);
    }
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    store.setLoading(true);
    try {
      await signInService(email, password);
    } finally {
      store.setLoading(false);
    }
  }, []);

  const signOut = useCallback(async () => {
    try {
      await signOutService();
    } catch (error) {
      console.error("Sign out error:", error);
    }
    store.signOut();
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await resetPasswordService(email);
  }, []);

  const unlockWithBiometrics = useCallback(async () => {
    const success = await authenticateWithBiometrics("Unlock StudentOS");
    if (success) {
      store.setLocked(false);
    }
    return success;
  }, []);

  const unlockWithPin = useCallback(async (pin: string) => {
    const valid = await verifyPinService(pin);
    if (valid) {
      store.setLocked(false);
    }
    return valid;
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    isBlocked,
    isLocked,
    biometricEnabled,
    pinSet,
    subscription,
    signUp,
    signIn,
    signOut,
    resetPassword,
    unlockWithBiometrics,
    unlockWithPin,
    initialize,
  };
}
