/**
 * Venue service – discovery and details.
 * Call from mobile/web with Supabase client; no direct table access from UI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Venue } from "../types";

export async function getVenues(supabase: SupabaseClient): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Venue[];
}

export async function getVenueById(supabase: SupabaseClient, id: string): Promise<Venue | null> {
  const { data, error } = await supabase.from("venues").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as Venue;
}

export async function getVenuesByCategory(
  supabase: SupabaseClient,
  category: string
): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("category", category)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Venue[];
}

export async function getPartnerVenues(supabase: SupabaseClient): Promise<Venue[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("is_partner", true)
    .order("rating", { ascending: false });
  if (error) throw error;
  return (data ?? []) as Venue[];
}
