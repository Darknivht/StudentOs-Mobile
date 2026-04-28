import { create } from "zustand";
import { createMMKV } from "react-native-mmkv";
import { persist, createJSONStorage } from "zustand/middleware";
import type { AuthUser, SubscriptionTier } from "../types";

interface AuthState {
  user: AuthUser | null;
  session: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: SubscriptionTier;
  isBlocked: boolean;
  isLocked: boolean;
  biometricEnabled: boolean;
  pinSet: boolean;

  setUser: (user: AuthUser | null) => void;
  setSession: (session: string | null) => void;
  setLoading: (loading: boolean) => void;
  setBlocked: (blocked: boolean) => void;
  setLocked: (locked: boolean) => void;
  setBiometricEnabled: (enabled: boolean) => void;
  setPinSet: (set: boolean) => void;
  setSubscription: (tier: SubscriptionTier) => void;
  signOut: () => void;
}

const mmkvStorage = createJSONStorage(() => {
  const mmkv = createMMKV({ id: "auth-storage" });
  return {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => mmkv.set(key, value),
    removeItem: (key: string) => {
      mmkv.remove(key);
    },
  };
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      subscription: "free",
      isBlocked: false,
      isLocked: true,
      biometricEnabled: false,
      pinSet: false,

      setUser: (user) =>
        set({
          user,
          isAuthenticated: !!user,
          subscription: user?.subscription || "free",
          isBlocked: user?.isBlocked || false,
        }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      setBlocked: (isBlocked) => set({ isBlocked }),
      setLocked: (isLocked) => set({ isLocked }),
      setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
      setPinSet: (pinSet) => set({ pinSet }),
      setSubscription: (subscription) => set({ subscription }),
      signOut: () =>
        set({
          user: null,
          session: null,
          isAuthenticated: false,
          isBlocked: false,
          isLocked: true,
          subscription: "free",
        }),
    }),
    {
      name: "auth-storage",
      storage: mmkvStorage,
      partialize: (state) => ({
        user: state.user,
        session: state.session,
        isAuthenticated: state.isAuthenticated,
        subscription: state.subscription,
        isBlocked: state.isBlocked,
        biometricEnabled: state.biometricEnabled,
        pinSet: state.pinSet,
      }),
    },
  ),
);
