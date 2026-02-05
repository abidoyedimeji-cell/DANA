/**
 * Profile service – get and update profile. Used by onboarding and profile screen.
 * Call from mobile/web with Supabase client; no direct table access from UI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../profile";
import { profileUpdateSchema } from "../validation/schemas";

export interface UpdateProfileInput {
  // Social fields
  display_name?: string;
  bio_social?: string;
  calendar_link_social?: string | null;
  
  // Professional fields
  headline?: string;
  bio_professional?: string;
  industry?: string;
  years_in_role?: number;
  seniority_level?: "junior" | "mid" | "senior" | "executive" | "founder";
  professional_intents?: string[];
  calendar_link_business?: string | null;
  
  // Basic fields
  firstName?: string;
  lastName?: string;
  location?: string;
  interests?: string[];
  
  // Profile completion
  is_profile_complete?: boolean;
  profile_mode?: "dating" | "business" | "both";
}

export async function getProfile(
  supabase: SupabaseClient,
  userId: string
): Promise<Profile | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Profile;
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileInput
): Promise<Profile> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  
  const row: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  
  // Social fields
  if (parsed.data.display_name !== undefined) row.display_name = parsed.data.display_name;
  if (parsed.data.bio_social !== undefined) row.bio_social = parsed.data.bio_social;
  if (parsed.data.calendar_link_social !== undefined) row.calendar_link_social = parsed.data.calendar_link_social;
  
  // Professional fields
  if (parsed.data.headline !== undefined) row.headline = parsed.data.headline;
  if (parsed.data.bio_professional !== undefined) row.bio_professional = parsed.data.bio_professional;
  if (parsed.data.industry !== undefined) row.industry = parsed.data.industry;
  if (parsed.data.years_in_role !== undefined) row.years_in_role = parsed.data.years_in_role;
  if (parsed.data.seniority_level !== undefined) row.seniority_level = parsed.data.seniority_level;
  if (parsed.data.professional_intents !== undefined) row.professional_intents = parsed.data.professional_intents;
  if (parsed.data.calendar_link_business !== undefined) row.calendar_link_business = parsed.data.calendar_link_business;
  
  // Basic fields
  if (parsed.data.firstName !== undefined) row.first_name = parsed.data.firstName;
  if (parsed.data.lastName !== undefined) row.last_name = parsed.data.lastName;
  if (parsed.data.location !== undefined) row.location = parsed.data.location;
  if (parsed.data.interests !== undefined) row.interests = parsed.data.interests;
  
  // Profile completion
  if (parsed.data.is_profile_complete !== undefined) row.is_profile_complete = parsed.data.is_profile_complete;
  if (parsed.data.profile_mode !== undefined) row.profile_mode = parsed.data.profile_mode;
  
  const { data, error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
