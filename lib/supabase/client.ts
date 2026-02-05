import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "[DANA] Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY). " +
    "Auth and database features will not work until they are configured."
  )
}

// Lazy singleton – only created once a caller actually needs it.
let _supabase: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (!_supabase) {
    if (!supabaseUrl || !supabaseAnonKey) {
      // Return a minimal client that won't crash but also won't work.
      // This lets the app render its UI even before env vars are set.
      _supabase = createBrowserClient(
        supabaseUrl || "https://placeholder.supabase.co",
        supabaseAnonKey || "placeholder-anon-key",
        {
          auth: {
            persistSession: false,
          },
        },
      )
    } else {
      _supabase = createBrowserClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          storageKey: "sb-wymttasffsddyauhibya-auth-token",
          storage: typeof window !== "undefined" ? window.localStorage : undefined,
        },
      })
    }
  }
  return _supabase
}

// Keep the same export shape so every consumer works unchanged.
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_target, prop, receiver) {
    return Reflect.get(getClient(), prop, receiver)
  },
})

export function createClient() {
  return getClient()
}
