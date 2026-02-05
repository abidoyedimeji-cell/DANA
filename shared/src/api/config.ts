/**
 * API/env contract for DANA. Web uses NEXT_PUBLIC_*; mobile can use Expo Constants.extra.
 * This file documents the expected env keys; each app reads them in its own way.
 */

export const ENV_KEYS = {
  SUPABASE_URL: "NEXT_PUBLIC_SUPABASE_URL",
  SUPABASE_ANON_KEY: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
} as const;
