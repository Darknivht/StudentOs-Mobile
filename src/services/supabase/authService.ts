import { supabase } from "./client";
import type { AuthUser, SubscriptionTier } from "../../types";

export async function signUp(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) {
    console.error("signIn error:", error.message);
    throw error;
  }
  console.log("signIn success, user:", data.user?.id);
  return data;
}

export async function signOut() {
  if (!supabase) throw new Error("Supabase not configured");

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  if (!supabase) throw new Error("Supabase not configured");

  const { data, error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
  return data;
}

export async function getSession() {
  if (!supabase) {
    console.warn("getSession: supabase client is null");
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error("getSession error:", error.message);
    throw error;
  }
  if (!data.session) {
    console.log("getSession: no active session");
  } else {
    console.log("getSession: session found for user", data.session.user?.id);
  }
  return data.session;
}

export async function fetchUserProfile(
  userId: string,
): Promise<AuthUser | null> {
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, email, display_name, avatar_url, subscription_tier, is_blocked, created_at",
    )
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Failed to fetch user profile:", error.message, error.code);
    return null;
  }

  if (!data) {
    console.warn("No profile row found for user:", userId);
    return null;
  }

  return {
    id: data.id,
    email: data.email,
    displayName: data.display_name || "",
    avatarUrl: data.avatar_url ?? undefined,
    subscription: (data.subscription_tier as SubscriptionTier) || "free",
    isBlocked: data.is_blocked ?? false,
    createdAt: data.created_at,
  };
}

export function onAuthStateChange(
  callback: (event: string, userId: string | null) => void,
) {
  if (!supabase) return { data: { subscription: { unsubscribe: () => {} } } };

  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session?.user?.id ?? null);
  });
}
