/**
 * Business Search Utilities
 * Weighted marketplace discovery logic for the Business Dimension
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Profile } from "../profile";

export interface BusinessFilters {
  intents: string[];
  seniority: string[];
  industry?: string;
}

/**
 * Search for profiles matching business filters
 * Results are weighted by verification status (Tier 3 first) and years_in_role
 */
export async function searchBusinessProfiles(
  supabase: SupabaseClient,
  filters: BusinessFilters
): Promise<Profile[]> {
  let query = supabase.from("profiles").select("*");

  // Primary filter: professional_intents (must match at least one intent)
  if (filters.intents.length > 0) {
    query = query.contains("professional_intents", filters.intents);
  }

  // Secondary filter: seniority_level
  if (filters.seniority.length > 0) {
    query = query.in("seniority_level", filters.seniority);
  }

  // Tertiary filter: industry (if provided)
  if (filters.industry && filters.industry !== "All") {
    query = query.eq("industry", filters.industry);
  }

  // Weighted ordering: Verified users first, then by years_in_role
  const { data, error } = await query
    .order("is_verified", { ascending: false })
    .order("years_in_role", { ascending: false });

  if (error) throw error;
  return (data || []) as Profile[];
}

/**
 * Find mentors matching criteria
 */
export async function findMentors(
  supabase: SupabaseClient,
  options: {
    industry?: string;
    minSeniority?: "senior" | "executive" | "founder";
  }
): Promise<Profile[]> {
  const filters: BusinessFilters = {
    intents: ["mentorship"],
    seniority: options.minSeniority
      ? ["senior", "executive", "founder"].slice(
          ["senior", "executive", "founder"].indexOf(options.minSeniority)
        )
      : ["senior", "executive", "founder"],
    industry: options.industry,
  };

  return searchBusinessProfiles(supabase, filters);
}

/**
 * Find investors matching criteria
 */
export async function findInvestors(
  supabase: SupabaseClient,
  options: {
    industry?: string;
  }
): Promise<Profile[]> {
  const filters: BusinessFilters = {
    intents: ["investing"],
    seniority: [],
    industry: options.industry,
  };

  return searchBusinessProfiles(supabase, filters);
}

/**
 * Find hiring opportunities
 */
export async function findHiring(
  supabase: SupabaseClient,
  options: {
    industry?: string;
    minYearsInRole?: number;
  }
): Promise<Profile[]> {
  let query = supabase
    .from("profiles")
    .select("*")
    .contains("professional_intents", ["hiring", "job_opportunities"]);

  if (options.industry && options.industry !== "All") {
    query = query.eq("industry", options.industry);
  }

  if (options.minYearsInRole) {
    query = query.gte("years_in_role", options.minYearsInRole);
  }

  const { data, error } = await query
    .order("is_verified", { ascending: false })
    .order("years_in_role", { ascending: false });

  if (error) throw error;
  return (data || []) as Profile[];
}
