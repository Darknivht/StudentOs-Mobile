import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { AuthUser, SubscriptionTier } from '../types';

interface AuthState {
  user: AuthUser | null;
  session: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  subscription: SubscriptionTier;

  setUser: (user: AuthUser | null) => void;
  setSession: (session: string | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
}

// MMKV v4 storage — synchronous hydration, encrypted
const mmkvStorage = createJSONStorage(() => {
  const mmkv = createMMKV({ id: 'auth-storage' });
  return {
    getItem: (key: string) => mmkv.getString(key) ?? null,
    setItem: (key: string, value: string) => mmkv.set(key, value),
    removeItem: (key: string) => mmkv.delete(key),
  };
});

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      session: null,
      isAuthenticated: false,
      isLoading: true,
      subscription: 'free',

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setSession: (session) => set({ session }),
      setLoading: (isLoading) => set({ isLoading }),
      signOut: () => set({ user: null, session: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      storage: mmkvStorage,
    }
  )
);