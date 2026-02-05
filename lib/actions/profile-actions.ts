"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getProfile(userId: string) {
  const supabase = await createClient()

  const { data: profile, error } = await supabase
    .from("profiles")
    .select(`
      *,
      profile_photos(*),
      user_preferences(*),
      quiz_questions(*)
    `)
    .eq("id", userId)
    .single()

  if (error) {
    console.error("[v0] Error fetching profile:", error)
    return { error: error.message }
  }

  return { profile }
}

export async function updateProfile(
  userId: string,
  data: {
    username?: string
    display_name?: string
    bio?: string
    avatar_url?: string
    age?: number
    location?: string
    height?: string
    love_language?: string
    profile_mode?: "dating" | "business" | "both"
  },
) {
  const supabase = await createClient()

  const { error } = await supabase
    .from("profiles")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId)

  if (error) {
    console.error("[v0] Error updating profile:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function addProfilePhoto(userId: string, photoUrl: string, displayOrder: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("profile_photos").insert({
    profile_id: userId,
    photo_url: photoUrl,
    display_order: displayOrder,
    is_primary: displayOrder === 0,
  })

  if (error) {
    console.error("[v0] Error adding photo:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function deleteProfilePhoto(photoId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("profile_photos").delete().eq("id", photoId)

  if (error) {
    console.error("[v0] Error deleting photo:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function updatePreferences(
  userId: string,
  preferences: {
    age_min?: number
    age_max?: number
    distance_radius?: number
    open_to_children?: boolean
    religious_preference?: string[]
    hobbies?: string[]
    lifestyle?: string[]
  },
) {
  const supabase = await createClient()

  const { error } = await supabase.from("user_preferences").upsert({
    profile_id: userId,
    ...preferences,
    updated_at: new Date().toISOString(),
  })

  if (error) {
    console.error("[v0] Error updating preferences:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function addQuizQuestion(userId: string, question: string, displayOrder: number) {
  const supabase = await createClient()

  const { error } = await supabase.from("quiz_questions").insert({
    profile_id: userId,
    question,
    display_order: displayOrder,
    is_active: true,
  })

  if (error) {
    console.error("[v0] Error adding quiz question:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}

export async function deleteQuizQuestion(questionId: string) {
  const supabase = await createClient()

  const { error } = await supabase.from("quiz_questions").delete().eq("id", questionId)

  if (error) {
    console.error("[v0] Error deleting quiz question:", error)
    return { error: error.message }
  }

  revalidatePath("/profile")
  return { success: true }
}
