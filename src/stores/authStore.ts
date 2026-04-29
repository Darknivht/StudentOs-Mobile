import { create } from "zustand";
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

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isLoading: false,
  subscription: "free",
  isBlocked: false,
  isLocked: false,
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
      isLocked: false,
      subscription: "free",
    }),
}));
