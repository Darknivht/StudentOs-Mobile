import { useState, useEffect, useCallback, useRef } from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "../services/supabase";

interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
  authReady: boolean;
  blockedMessage: string | null;
}

interface AuthActions {
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (newPassword: string) => Promise<{ error: Error | null }>;
  setSessionFromTokens: (accessToken: string, refreshToken: string) => Promise<void>;
}

export type AuthContextType = AuthState & AuthActions;

export function useAuthCore(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authReady, setAuthReady] = useState(false);
  const [blockedMessage, setBlockedMessage] = useState<string | null>(null);
  const blockedCheckInterval = useRef<ReturnType<typeof setInterval> | null>(null);

  const checkBlocked = useCallback(async (userId: string) => {
    try {
      const { data } = await supabase
        .from("profiles")
        .select("is_blocked")
        .eq("user_id", userId)
        .single();
      if (data?.is_blocked) {
        setBlockedMessage("Your account has been blocked. Contact support.");
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
      }
    } catch {
      // ignore — profile may not exist yet for new signups
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      setAuthReady(true);
      if (s?.user) checkBlocked(s.user.id);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
      setAuthReady(true);
      setBlockedMessage(null);
      if (s?.user) checkBlocked(s.user.id);
    });

    return () => subscription.unsubscribe();
  }, [checkBlocked]);

  // TODO: Enable Supabase Realtime for profiles table in production
  // Go to Supabase Dashboard → Database → Replication → Enable "profiles" table
  // Then replace polling with realtime subscription for instant blocking detection
  useEffect(() => {
    if (user) {
      blockedCheckInterval.current = setInterval(() => {
        checkBlocked(user.id);
      }, 5 * 60 * 1000);

      return () => {
        if (blockedCheckInterval.current) clearInterval(blockedCheckInterval.current);
      };
    } else {
      if (blockedCheckInterval.current) clearInterval(blockedCheckInterval.current);
    }
  }, [user, checkBlocked]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: "studentos://reset-password",
      },
    });
    return { error: error as Error | null };
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setBlockedMessage(null);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: "studentos://reset-password",
    });
    return { error: error as Error | null };
  }, []);

  const updatePassword = useCallback(async (newPassword: string) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error: error as Error | null };
  }, []);

  const setSessionFromTokens = useCallback(
    async (accessToken: string, refreshToken: string) => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (error) throw error;
    },
    []
  );

  return {
    user,
    session,
    loading,
    authReady,
    blockedMessage,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    setSessionFromTokens,
  };
}
