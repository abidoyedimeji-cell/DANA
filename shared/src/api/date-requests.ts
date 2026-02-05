/**
 * Date request service – create, list, accept/decline.
 * Call from mobile/web with Supabase client; no direct table access from UI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { DateRequest, DateRequestStatus } from "../types";
import { dateRequestCreateSchema, dateRequestUpdateStatusSchema } from "../validation/schemas";

export interface CreateDateRequestInput {
  invitee_id: string;
  venue_id: string | null;
  proposed_date: string;
  proposed_time: string;
  message?: string;
}

export async function createDateRequest(
  supabase: SupabaseClient,
  inviterId: string,
  input: CreateDateRequestInput
): Promise<DateRequest> {
  const parsed = dateRequestCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const { data, error } = await supabase
    .from("date_invites")
    .insert({
      inviter_id: inviterId,
      invitee_id: parsed.data.invitee_id,
      venue_id: parsed.data.venue_id ?? null,
      proposed_date: parsed.data.proposed_date,
      proposed_time: parsed.data.proposed_time,
      message: parsed.data.message ?? null,
      status: "pending",
    })
    .select()
    .single();
  if (error) throw error;
  return data as DateRequest;
}

export async function getDateRequestsForUser(
  supabase: SupabaseClient,
  userId: string
): Promise<DateRequest[]> {
  const { data, error } = await supabase
    .from("date_invites")
    .select("*, venue:venues(*), inviter:profiles!inviter_id(*), invitee:profiles!invitee_id(*)")
    .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as DateRequest[];
}

export async function getDateRequestById(
  supabase: SupabaseClient,
  id: string
): Promise<DateRequest | null> {
  const { data, error } = await supabase
    .from("date_invites")
    .select("*, venue:venues(*), inviter:profiles!inviter_id(*), invitee:profiles!invitee_id(*)")
    .eq("id", id)
    .single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as DateRequest;
}

export async function updateDateRequestStatus(
  supabase: SupabaseClient,
  id: string,
  status: DateRequestStatus,
  options?: { reason?: string; new_proposed_date?: string; new_proposed_time?: string }
): Promise<DateRequest> {
  const parsed = dateRequestUpdateStatusSchema.safeParse({ status, ...options });
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const updates: Record<string, unknown> = { status, updated_at: new Date().toISOString() };
  if (parsed.data.new_proposed_date) updates.proposed_date = parsed.data.new_proposed_date;
  if (parsed.data.new_proposed_time) updates.proposed_time = parsed.data.new_proposed_time;
  const { data, error } = await supabase
    .from("date_invites")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DateRequest;
}

/** Mark inviter deposit as paid (call after Stripe/checkout success). Only inviter can call. */
export async function markInviterPaid(
  supabase: SupabaseClient,
  inviteId: string
): Promise<void> {
  const { error } = await supabase.rpc("mark_inviter_paid", { p_invite_id: inviteId });
  if (error) throw error;
}

/** Mark invitee deposit as paid (inviter must have paid first). Only invitee can call. */
export async function markInviteePaid(
  supabase: SupabaseClient,
  inviteId: string
): Promise<void> {
  const { error } = await supabase.rpc("mark_invitee_paid", { p_invite_id: inviteId });
  if (error) throw error;
}
