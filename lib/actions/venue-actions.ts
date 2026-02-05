"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function getVenues() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("venues").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching venues:", error)
    return []
  }

  return data || []
}

export async function createVenue(venueData: {
  name: string
  description?: string
  address?: string
  city?: string
  category?: string
  image_url?: string
  rating?: number
  price_range?: number
  features?: string[]
  promo_text?: string
  is_partner?: boolean
}) {
  const supabase = await createServerClient()

  const { data, error } = await supabase
    .from("venues")
    .insert({
      ...venueData,
      city: venueData.city || "London",
    })
    .select()
    .single()

  if (error) {
    console.error("[v0] Error creating venue:", error)
    throw new Error(error.message)
  }

  return data
}

export async function updateVenue(
  id: string,
  updates: Partial<{
    name: string
    description: string
    address: string
    city: string
    category: string
    image_url: string
    rating: number
    price_range: number
    features: string[]
    promo_text: string
    is_partner: boolean
  }>,
) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.from("venues").update(updates).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating venue:", error)
    throw new Error(error.message)
  }

  return data
}

export async function deleteVenue(id: string) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("venues").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting venue:", error)
    throw new Error(error.message)
  }

  return true
}
