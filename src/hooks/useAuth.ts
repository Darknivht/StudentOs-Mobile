import { useEffect, useCallback, useRef } from "react";
import { AppState } from "react-native";
import { useAuthStore } from "../stores/authStore";
import type { AuthUser } from "../types";
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

let globalInitialized = false;
let lastSignInTime = 0;

async function loadSecuritySettings(store: {
  setBiometricEnabled: (v: boolean) => void;
  setPinSet: (v: boolean) => void;
  setLocked: (v: boolean) => void;
}): Promise<void> {
  try {
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
  } catch (e) {
    console.warn("Auth: security settings check failed", e);
    store.setLocked(false);
  }
}

function makeFallbackUser(userId: string, email?: string): AuthUser {
  return {
    id: userId,
    email: email || "",
    displayName: "",
    subscription: "free",
    isBlocked: false,
    createdAt: new Date().toISOString(),
  };
}

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
    if (initializedRef.current || globalInitialized) return;
    initializedRef.current = true;
    globalInitialized = true;

    store.setLoading(true);

    const hardTimeout = setTimeout(() => {
      console.warn("Auth init: hard timeout — forcing loading=false");
      store.setUser(null);
      store.setLocked(false);
      store.setLoading(false);
    }, 8000);

    try {
      const session = await Promise.race([
        getSession(),
        new Promise<null>((_, reject) =>
          setTimeout(() => reject(new Error("getSession timeout")), 5000),
        ),
      ]).catch(() => null);

      if (session?.user) {
        let profileSet = false;
        try {
          const profile = await fetchUserProfile(session.user.id);
          if (profile) {
            if (profile.isBlocked) {
              await signOutService();
              store.signOut();
              return;
            }
            store.setUser(profile);
            profileSet = true;
          }
        } catch (e) {
          console.warn("Auth init: fetchUserProfile failed", e);
        }

        if (!profileSet) {
          console.warn(
            "Auth init: no profile row, using fallback user for",
            session.user.id,
          );
          store.setUser(makeFallbackUser(session.user.id, session.user.email));
        }

        await loadSecuritySettings(store);
      } else {
        store.setUser(null);
        store.setLocked(false);
      }
    } catch (e) {
      console.warn("Auth init: unexpected error", e);
      store.setUser(null);
      store.setLocked(false);
    } finally {
      clearTimeout(hardTimeout);
      store.setLoading(false);
    }
  }, []);

  useEffect(() => {
    initialize();

    const { data } = onAuthStateChange(async (event, userId) => {
      if (event === "SIGNED_IN" && userId) {
        if (Date.now() - lastSignInTime < 3000) {
          console.warn("Auth: skipping duplicate SIGNED_IN event");
          return;
        }
        lastSignInTime = Date.now();

        let profileSet = false;
        try {
          const profile = await fetchUserProfile(userId);
          if (profile) {
            if (profile.isBlocked) {
              await signOutService();
              store.signOut();
              return;
            }
            store.setUser(profile);
            profileSet = true;
          }
        } catch (e) {
          console.warn("Auth onAuthStateChange: fetchUserProfile failed", e);
        }

        if (!profileSet) {
          const session = await getSession().catch(() => null);
          store.setUser(
            makeFallbackUser(userId, session?.user?.email || undefined),
          );
        }

        await loadSecuritySettings(store);
      } else if (event === "SIGNED_OUT") {
        store.signOut();
      } else if (event === "TOKEN_REFRESHED") {
        // no-op, session persists
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
    lastSignInTime = Date.now();
    try {
      const result = await signInService(email, password);
      if (result?.user) {
        let profileSet = false;
        try {
          const profile = await fetchUserProfile(result.user.id);
          if (profile) {
            if (profile.isBlocked) {
              await signOutService();
              store.signOut();
              return;
            }
            store.setUser(profile);
            profileSet = true;
          }
        } catch (e) {
          console.warn("signIn: fetchUserProfile failed, using fallback", e);
        }

        if (!profileSet) {
          store.setUser(makeFallbackUser(result.user.id, result.user.email));
        }

        await loadSecuritySettings(store);
      }
    } catch (err) {
      console.error("signIn: failed", err);
      throw err;
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
