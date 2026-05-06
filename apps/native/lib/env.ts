const envSchema = {
  EXPO_PUBLIC_SUPABASE_URL: (v: string) =>
    v.startsWith("https://") && v.includes(".supabase.co"),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: (v: string) =>
    v.startsWith("eyJ") && v.length > 20,
} as const;

type EnvKey = keyof typeof envSchema;

function validateEnv(): Record<EnvKey, string> {
  const result = {} as Record<EnvKey, string>;
  for (const [key, validator] of Object.entries(envSchema)) {
    const value = process.env[key as EnvKey];
    if (!value) {
      throw new Error(`Missing env var: ${key}`);
    }
    if (!validator(value)) {
      throw new Error(`Invalid env var: ${key}`);
    }
    result[key as EnvKey] = value;
  }
  return result;
}

export const env = validateEnv();
