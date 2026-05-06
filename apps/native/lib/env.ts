import { z } from "zod";

const envSchema = z.object({
  EXPO_PUBLIC_SUPABASE_URL: z.string().url(),
  EXPO_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  EXPO_PUBLIC_PAYSTACK_KEY: z.string().min(1),
});

export type Env = z.infer<typeof envSchema>;

let parsedEnv: Env | null = null;
let envError: string | null = null;

try {
  parsedEnv = envSchema.parse({
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_PAYSTACK_KEY: process.env.EXPO_PUBLIC_PAYSTACK_KEY,
  });
} catch (e) {
  if (e instanceof z.ZodError) {
    envError = e.errors.map((err) => `${err.path.join(".")}: ${err.message}`).join(", ");
  } else {
    envError = String(e);
  }
}

export const env = parsedEnv!;
export const envParseError = envError;
