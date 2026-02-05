"use client"

import { useMemo } from "react"
import { createClient } from "./client"
import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Hook to get the singleton Supabase client instance
 * This ensures the same client is reused across renders
 */
export function useSupabaseClient(): SupabaseClient {
  const client = useMemo(() => {
    console.log("[v0] useSupabaseClient: Getting client instance")
    return createClient()
  }, [])

  return client
}
