/**
 * Meeting Requests API - High-Intent Connection Engine
 * Handles connection requests with venue and availability context
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import {
  meetingRequestCreateSchema,
  meetingRequestUpdateSchema,
} from "../validation/schemas";
import type {
  MeetingRequest,
  MeetingRequestIntent,
  MeetingRequestStatus,
} from "../types";

export interface CreateMeetingRequestInput {
  receiver_id: string;
  intent_type: MeetingRequestIntent;
  venue_id?: string | null;
  proposed_time?: string | null;
  message: string;
  meeting_window_preference?: string | null;
  duration_minutes?: number;
}

export interface UpdateMeetingRequestInput {
  status: MeetingRequestStatus;
  proposed_time?: string | null;
  message?: string;
}

/**
 * Create a meeting request
 */
export async function createMeetingRequest(
  supabase: SupabaseClient,
  senderId: string,
  input: CreateMeetingRequestInput
): Promise<MeetingRequest> {
  const parsed = meetingRequestCreateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid request input");
  }

  const { data, error } = await supabase
    .from("meeting_requests")
    .insert({
      sender_id: senderId,
      receiver_id: parsed.data.receiver_id,
      intent_type: parsed.data.intent_type,
      venue_id: parsed.data.venue_id ?? null,
      proposed_time: parsed.data.proposed_time ?? null,
      message: parsed.data.message,
      meeting_window_preference: parsed.data.meeting_window_preference ?? null,
      duration_minutes: parsed.data.duration_minutes ?? input.duration_minutes ?? 60,
    })
    .select()
    .single();

  if (error) throw error;
  return data as MeetingRequest;
}

/**
 * Update a meeting request (accept/decline)
 */
export async function updateMeetingRequest(
  supabase: SupabaseClient,
  requestId: string,
  userId: string,
  input: UpdateMeetingRequestInput
): Promise<MeetingRequest> {
  const parsed = meetingRequestUpdateSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.errors[0]?.message ?? "Invalid update input");
  }

  // Verify user has permission (must be sender or receiver)
  const { data: existing } = await supabase
    .from("meeting_requests")
    .select("sender_id, receiver_id")
    .eq("id", requestId)
    .single();

  if (!existing || (existing.sender_id !== userId && existing.receiver_id !== userId)) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("meeting_requests")
    .update({
      status: parsed.data.status,
      proposed_time: parsed.data.proposed_time ?? undefined,
      message: parsed.data.message ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", requestId)
    .select()
    .single();

  if (error) throw error;
  return data as MeetingRequest;
}

/**
 * Get pending meeting requests for a user (as receiver)
 */
export async function getPendingRequests(
  supabase: SupabaseClient,
  userId: string
): Promise<MeetingRequest[]> {
  const { data, error } = await supabase
    .from("meeting_requests")
    .select(
      `
      *,
      sender:profiles!meeting_requests_sender_id_fkey(*),
      receiver:profiles!meeting_requests_receiver_id_fkey(*),
      venue:venues(*)
    `
    )
    .eq("receiver_id", userId)
    .eq("status", "pending")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as MeetingRequest[];
}

/**
 * Get sent meeting requests for a user (as sender)
 */
export async function getSentRequests(
  supabase: SupabaseClient,
  userId: string
): Promise<MeetingRequest[]> {
  const { data, error } = await supabase
    .from("meeting_requests")
    .select(
      `
      *,
      sender:profiles!meeting_requests_sender_id_fkey(*),
      receiver:profiles!meeting_requests_receiver_id_fkey(*),
      venue:venues(*)
    `
    )
    .eq("sender_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data || []) as MeetingRequest[];
}

/**
 * Get venues filtered by suitability tags (for context-aware suggestions)
 */
export async function getVenuesBySuitability(
  supabase: SupabaseClient,
  tags: string[]
): Promise<any[]> {
  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .contains("suitability_tags", tags)
    .order("rating", { ascending: false });

  if (error) throw error;
  return data || [];
}
