import { createBrowserClient } from "@supabase/ssr"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabaseSingleton: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== "undefined") {
      console.warn("Missing Supabase environment variables (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY)")
    }
    return null
  }
  if (!supabaseSingleton) {
    supabaseSingleton = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        storageKey: "sb-wymttasffsddyauhibya-auth-token",
        storage: typeof window !== "undefined" ? window.localStorage : undefined,
      },
    })
  }
  return supabaseSingleton
}

// Lazy proxy so imports don't throw - consumers must handle null
export const supabase = new Proxy({} as ReturnType<typeof createBrowserClient>, {
  get(_, prop) {
    const client = getClient()
    if (!client) return undefined
    const value = (client as Record<string | symbol, unknown>)[prop]
    return typeof value === "function" ? value.bind(client) : value
  },
})

export function createClient() {
  const client = getClient()
  return client ?? (supabase as ReturnType<typeof createBrowserClient>)
}
