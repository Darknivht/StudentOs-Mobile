import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/database";

interface SupabaseConfig {
  url: string;
  anonKey: string;
  storageAdapter: {
    getItem: (key: string) => Promise<string | null>;
    setItem: (key: string, value: string) => Promise<void>;
    removeItem: (key: string) => Promise<void>;
  };
}

export function createSupabaseClient({ url, anonKey, storageAdapter }: SupabaseConfig) {
  return createClient<Database>(url, anonKey, {
    auth: {
      storage: storageAdapter,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  });
}
