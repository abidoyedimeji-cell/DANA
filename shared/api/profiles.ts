export * from "../src/api/profiles";
/**
 * Profile service – get and update profile. Used by onboarding and profile screen.
 * Call from mobile/web with Supabase client; no direct table access from UI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../types";
import { profileUpdateSchema } from "../validation/schemas";

export interface UpdateProfileInput {
  firstName?: string;
  lastName?: string;
  bio?: string;
  location?: string;
  interests?: string[];
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
  if (parsed.data.firstName !== undefined) row.first_name = parsed.data.firstName;
  if (parsed.data.bio !== undefined) row.bio = parsed.data.bio;
  if (parsed.data.location !== undefined) row.location = parsed.data.location;
  // last_name, interests: add DB columns and set here when ready
  const { data, error } = await supabase
    .from("profiles")
    .update(row)
    .eq("id", userId)
    .select()
    .single();
  if (error) throw error;
  return data as Profile;
}
