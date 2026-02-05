"use server"

import { createClient } from "@/lib/supabase/server"

export async function getDiscoverProfiles(filters?: {
  ageMin?: number
  ageMax?: number
  distanceRadius?: number
  verifiedOnly?: boolean
  hobbies?: string[]
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select(`
      *,
      profile_photos!inner(photo_url, is_primary),
      user_preferences(hobbies)
    `)
    .eq("profile_photos.is_primary", true)
    .limit(filters?.limit || 20)
    .range(filters?.offset || 0, (filters?.offset || 0) + (filters?.limit || 20) - 1)

  if (filters?.ageMin) {
    query = query.gte("age", filters.ageMin)
  }

  if (filters?.ageMax) {
    query = query.lte("age", filters.ageMax)
  }

  if (filters?.verifiedOnly) {
    query = query.eq("is_verified", true)
  }

  const { data: profiles, error } = await query

  if (error) {
    console.error("[v0] Error fetching discover profiles:", error)
    return { profiles: [], error: error.message }
  }

  return { profiles: profiles || [] }
}

export async function searchProfiles(
  searchQuery: string,
  filters?: {
    ageMin?: number
    ageMax?: number
    distanceRadius?: number
    verifiedOnly?: boolean
    hobbies?: string[]
  },
) {
  const supabase = await createClient()

  let query = supabase
    .from("profiles")
    .select(`
      *,
      profile_photos(photo_url, is_primary),
      user_preferences(hobbies)
    `)
    .or(`username.ilike.%${searchQuery}%,display_name.ilike.%${searchQuery}%,location.ilike.%${searchQuery}%`)

  if (filters?.ageMin) {
    query = query.gte("age", filters.ageMin)
  }

  if (filters?.ageMax) {
    query = query.lte("age", filters.ageMax)
  }

  if (filters?.verifiedOnly) {
    query = query.eq("is_verified", true)
  }

  const { data: profiles, error } = await query

  if (error) {
    console.error("[v0] Error searching profiles:", error)
    return { profiles: [], error: error.message }
  }

  return { profiles: profiles || [] }
}
