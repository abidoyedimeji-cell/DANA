/**
 * Profile Privacy Utilities
 * 
 * Helper functions to filter sensitive profile fields based on connection status.
 * Uses the RLS helper function `are_users_connected` from the database.
 * 
 * Sensitive fields (connection-only):
 * - calendar_link_social
 * - calendar_link_business (for business connections)
 * - bio_social
 * 
 * Public fields (visible to all):
 * - display_name
 * - headline
 * - industry
 * - avatar_url
 * - is_verified
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Profile } from '../profile';

/**
 * Check if two users are connected (have an accepted connection)
 * Uses the RLS helper function from the database
 */
export async function areUsersConnected(
  supabase: SupabaseClient,
  userId: string,
  targetUserId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('are_users_connected', {
      p_user_id: userId,
      p_target_id: targetUserId,
    });

    if (error) {
      console.error('Error checking connection status:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Exception checking connection status:', error);
    return false;
  }
}

/**
 * Filter sensitive fields from a profile based on connection status
 * Returns a sanitized profile with sensitive fields set to null if not connected
 */
export async function filterSensitiveProfileFields(
  supabase: SupabaseClient,
  profile: Profile,
  viewerUserId: string,
  isOwnProfile: boolean = false
): Promise<Profile> {
  // Always show all fields for own profile
  if (isOwnProfile || profile.id === viewerUserId) {
    return profile;
  }

  // Check if users are connected
  const isConnected = await areUsersConnected(supabase, viewerUserId, profile.id);

  // If not connected, hide sensitive fields
  if (!isConnected) {
    return {
      ...profile,
      calendar_link_social: null,
      calendar_link_business: null,
      bio_social: null,
    };
  }

  // If connected, show all fields
  return profile;
}

/**
 * Filter sensitive fields from an array of profiles
 * More efficient than calling filterSensitiveProfileFields for each profile
 * as it batches the connection checks
 */
export async function filterSensitiveProfileFieldsBatch(
  supabase: SupabaseClient,
  profiles: Profile[],
  viewerUserId: string
): Promise<Profile[]> {
  // Check connections for all profiles at once
  const connectionChecks = await Promise.all(
    profiles.map((profile) => {
      if (profile.id === viewerUserId) {
        return Promise.resolve({ profileId: profile.id, isConnected: true });
      }
      return areUsersConnected(supabase, viewerUserId, profile.id).then((isConnected) => ({
        profileId: profile.id,
        isConnected,
      }));
    })
  );

  // Create a map for quick lookup
  const connectionMap = new Map(
    connectionChecks.map((check) => [check.profileId, check.isConnected])
  );

  // Filter profiles based on connection status
  return profiles.map((profile) => {
    if (profile.id === viewerUserId) {
      return profile; // Always show own profile
    }

    const isConnected = connectionMap.get(profile.id) ?? false;

    if (!isConnected) {
      return {
        ...profile,
        calendar_link_social: null,
        calendar_link_business: null,
        bio_social: null,
      };
    }

    return profile;
  });
}
