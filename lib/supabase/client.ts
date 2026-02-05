import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create the singleton instance once at module initialization
const supabaseSingleton = createBrowserClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    storageKey: "sb-wymttasffsddyauhibya-auth-token",
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
  },
})

export const supabase = supabaseSingleton

export function createClient() {
  return supabaseSingleton
}
