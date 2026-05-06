import { createSupabaseClient } from "@studentos/shared";
import { ExpoSecureStoreAdapter } from "./secure-storage";
import { env } from "../lib/env";

export const supabase = createSupabaseClient({
  url: env.EXPO_PUBLIC_SUPABASE_URL,
  anonKey: env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  storageAdapter: ExpoSecureStoreAdapter,
});
