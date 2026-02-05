/**
 * Booking swap – check if allowed and execute (inviter only). Fee £1.99 charged separately.
 */
import type { SupabaseClient } from "@supabase/supabase-js";

export interface CanSwapResult {
  allowed: boolean;
  message: string;
}

export async function canSwapBooking(
  supabase: SupabaseClient,
  dateInviteId: string,
  newVenueId: string,
  newTimeSlot: string
): Promise<CanSwapResult> {
  const { data, error } = await supabase.rpc("can_swap_booking", {
    p_date_invite_id: dateInviteId,
    p_new_venue_id: newVenueId,
    p_new_time_slot: newTimeSlot,
  });
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return {
    allowed: Boolean(row?.allowed),
    message: (row?.message as string) ?? "Unknown",
  };
}

export async function executeBookingSwap(
  supabase: SupabaseClient,
  dateInviteId: string,
  newVenueId: string,
  newTimeSlot: string,
  options?: { newProposedDate?: string; newProposedTime?: string }
): Promise<string> {
  const { data, error } = await supabase.rpc("execute_booking_swap", {
    p_date_invite_id: dateInviteId,
    p_new_venue_id: newVenueId,
    p_new_time_slot: newTimeSlot,
    p_new_proposed_date: options?.newProposedDate ?? null,
    p_new_proposed_time: options?.newProposedTime ?? null,
  });
  if (error) throw error;
  return data as string;
}
