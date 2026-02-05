/**
 * Profile type definition – single source of truth for web + mobile.
 * Aligns with the `profiles` table in Supabase.
 */

export type ProfileMode = "dating" | "business" | "both";

export interface Profile {
  id: string;
  display_name: string | null;
  username: string | null;
  first_name?: string | null;
  last_name?: string | null;
  bio?: string | null;
  bio_social?: string | null;
  bio_professional?: string | null;
  headline?: string | null;
  age?: number | null;
  gender?: string | null;
  location?: string | null;
  avatar_url?: string | null;
  interests?: string[] | null;
  is_verified?: boolean;
  is_profile_complete?: boolean;
  profile_mode?: ProfileMode | null;
  industry?: string | null;
  years_in_role?: number | null;
  seniority_level?: "junior" | "mid" | "senior" | "executive" | "founder" | null;
  professional_intents?: string[] | null;
  calendar_link_social?: string | null;
  calendar_link_business?: string | null;
  phone?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}
