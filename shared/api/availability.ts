export * from "../src/api/availability";
/**
 * Availability service – event slots for venues.
 * Call from mobile/web with Supabase client; no direct table access from UI.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AvailabilityBlock, DanaEvent, DanaHold, DanaIntersectionWindow, EventSlot } from "../types";
import {
  availabilityBlockSchema,
  checkAvailabilitySchema,
  danaHoldCreateSchema,
  danaIntersectionInputSchema,
} from "../validation/schemas";

export async function getEventSlotsByVenue(
  supabase: SupabaseClient,
  venueId: string,
  fromDate?: string,
  toDate?: string
): Promise<EventSlot[]> {
  let q = supabase
    .from("event_slots")
    .select("*")
    .eq("venue_id", venueId)
    .eq("is_available", true)
    .order("slot_start", { ascending: true });
  if (fromDate) q = q.gte("slot_start", fromDate);
  if (toDate) q = q.lte("slot_end", toDate);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []) as EventSlot[];
}

export async function getEventSlotById(
  supabase: SupabaseClient,
  id: string
): Promise<EventSlot | null> {
  const { data, error } = await supabase.from("event_slots").select("*").eq("id", id).single();
  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data as EventSlot;
}

export async function getAvailabilityBlocksByUser(
  supabase: SupabaseClient,
  userId: string
): Promise<AvailabilityBlock[]> {
  const { data, error } = await supabase
    .from("dana_availability")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as AvailabilityBlock[];
}

export async function createAvailabilityBlock(
  supabase: SupabaseClient,
  input: { user_id: string; time_slot: string; slot_type?: "one-off" | "recurring" }
): Promise<AvailabilityBlock> {
  const parsed = availabilityBlockSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const { data, error } = await supabase
    .from("dana_availability")
    .insert({
      user_id: parsed.data.user_id,
      time_slot: parsed.data.time_slot,
      slot_type: parsed.data.slot_type ?? "one-off",
    })
    .select()
    .single();
  if (error) throw error;
  return data as AvailabilityBlock;
}

export async function deleteAvailabilityBlock(
  supabase: SupabaseClient,
  id: string
): Promise<void> {
  const { error } = await supabase.from("dana_availability").delete().eq("id", id);
  if (error) throw error;
}

export async function getDanaIntersection(
  supabase: SupabaseClient,
  input: { host_id: string; guest_id: string; venue_id: string; meeting_duration?: string }
): Promise<DanaIntersectionWindow[]> {
  const parsed = danaIntersectionInputSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const { data, error } = await supabase.rpc("get_dana_intersection", {
    host_id: parsed.data.host_id,
    guest_id: parsed.data.guest_id,
    target_venue_id: parsed.data.venue_id,
    meeting_duration: parsed.data.meeting_duration ?? "90 minutes",
  });
  if (error) throw error;
  return (data ?? []) as DanaIntersectionWindow[];
}

export async function createDanaHold(
  supabase: SupabaseClient,
  input: {
    host_id: string;
    guest_id: string;
    venue_id: string;
    time_slot: string;
    meeting_duration?: string;
    hold_ttl?: string;
  }
): Promise<DanaHold> {
  const parsed = danaHoldCreateSchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const { data, error } = await supabase.rpc("create_dana_hold", {
    host_id: parsed.data.host_id,
    guest_id: parsed.data.guest_id,
    venue_id: parsed.data.venue_id,
    time_slot: parsed.data.time_slot,
    meeting_duration: parsed.data.meeting_duration ?? "90 minutes",
    hold_ttl: parsed.data.hold_ttl ?? "5 minutes",
  });
  if (error) throw error;
  const holdId = data as string;
  const { data: hold, error: holdError } = await supabase
    .from("dana_table_holds")
    .select("*")
    .eq("id", holdId)
    .single();
  if (holdError) throw holdError;
  return hold as DanaHold;
}

export async function confirmDanaBooking(
  supabase: SupabaseClient,
  holdId: string,
  dateInviteId: string
): Promise<DanaEvent> {
  const { data, error } = await supabase.rpc("confirm_dana_booking", {
    hold_id: holdId,
    p_date_invite_id: dateInviteId,
  });
  if (error) throw error;
  const eventId = data as string;
  const { data: event, error: eventError } = await supabase
    .from("dana_events")
    .select("*")
    .eq("id", eventId)
    .single();
  if (eventError) throw eventError;
  return event as DanaEvent;
}

export async function checkVenueAvailability(
  supabase: SupabaseClient,
  input: { venue_id: string; start_at: string; party_size: number }
): Promise<boolean> {
  const parsed = checkAvailabilitySchema.safeParse(input);
  if (!parsed.success) throw new Error(parsed.error.errors[0]?.message ?? "Invalid input");
  const { data, error } = await supabase.rpc("check_availability", {
    venue_id: parsed.data.venue_id,
    start_at: parsed.data.start_at,
    party_size: parsed.data.party_size,
  });
  if (error) throw error;
  return Boolean(data);
}
