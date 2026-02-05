/**
 * Authoritative domain types for DANA (web + mobile).
 * Align with Supabase schema and RLS.
 */

import type { Profile } from "../profile";

// ----- Auth & profile -----
export interface User {
  id: string;
  email?: string | null;
}

// ----- Venues & availability -----
export interface Venue {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  address?: string | null;
  city?: string | null;
  image_url: string | null;
  category: string | null;
  price_range: string | null;
  rating: number | null;
  is_partner: boolean;
  promo_text: string | null;
  suitability_tags?: string[] | null; // 'social', 'business', or both
  business_amenities?: string[] | null; // 'wifi', 'quiet_space', 'meeting_room', etc.
  created_at?: string | null;
}

export type ReservationType = "walk_in" | "timed_table" | "timed_room";
export type ReservationStatus = "confirmed" | "cancelled";

export interface VenueHours {
  id: string;
  venue_id: string;
  day_of_week: number; // 0-6
  opens_at: string; // HH:MM:SS
  closes_at: string; // HH:MM:SS
  is_closed: boolean;
  created_at?: string | null;
}

export interface VenueBookingRules {
  id: string;
  venue_id: string;
  timezone: string;
  capacity: number;
  turn_minutes: number;
  last_seating_time: string; // HH:MM:SS
  enabled_booking_types: ReservationType[];
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ReservationHold {
  id: string;
  venue_id: string;
  reservation_type: ReservationType;
  party_size: number;
  start_at: string;
  end_at: string;
  time_slot: string; // TSTZRANGE text
  expires_at: string;
  created_at?: string | null;
}

export interface Reservation {
  id: string;
  venue_id: string;
  reservation_type: ReservationType;
  party_size: number;
  start_at: string;
  end_at: string;
  time_slot: string; // TSTZRANGE text
  status: ReservationStatus;
  created_at?: string | null;
}

export interface EventSlot {
  id: string;
  venue_id: string;
  slot_start: string; // ISO datetime
  slot_end: string;
  max_guests: number;
  is_available: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export type AvailabilitySlotType = "one-off" | "recurring";

export interface AvailabilityBlock {
  id: string;
  user_id: string;
  time_slot: string; // TSTZRANGE text
  slot_type: AvailabilitySlotType;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DanaIntersectionWindow {
  meeting_window: string; // TSTZRANGE text
}

export interface DanaHold {
  id: string;
  venue_id: string;
  host_id: string;
  guest_id: string;
  time_slot: string; // TSTZRANGE text
  expires_at: string;
  created_at?: string | null;
}

export interface DanaEvent {
  id: string;
  venue_id: string;
  host_id: string;
  guest_id: string;
  time_slot: string; // TSTZRANGE text
  date_invite_id?: string | null;
  created_at?: string | null;
}

// ----- Date request flow (date_invites) -----
export type DateRequestStatus = "pending" | "accepted" | "declined" | "cancelled" | "completed";

export interface DateRequest {
  id: string;
  inviter_id: string;
  invitee_id: string;
  venue_id: string | null;
  proposed_date: string; // YYYY-MM-DD
  proposed_time: string; // HH:MM or full ISO
  message: string | null;
  status: DateRequestStatus;
  inviter_paid: boolean;
  invitee_paid: boolean;
  deposit_amount: number;
  duration_minutes: number | null; // From 024 migration - default 90
  created_at: string;
  updated_at: string;
  venue?: Venue | null;
  inviter?: Profile | null;
  invitee?: Profile | null;
}

/** Same as DateRequest when status is accepted/completed; used for "confirmed date" view. */
export type Date = DateRequest;

// ----- Post-date review -----
export interface Review {
  id: string;
  date_request_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ----- Verification -----
export type VerificationType = "id_scan" | "selfie";

export type VerificationStatus = "pending" | "approved" | "rejected";

export interface Verification {
  id: string;
  profile_id: string;
  type: VerificationType;
  status: VerificationStatus;
  verified_at: string | null;
  created_at: string;
  updated_at?: string | null;
}

// ----- High-Intent Connection Engine -----
export type MeetingRequestIntent =
  | "social"
  | "business_mentorship"
  | "business_investing"
  | "business_networking";

export type MeetingRequestStatus = "pending" | "accepted" | "declined" | "cancelled";

export interface MeetingRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  intent_type: MeetingRequestIntent;
  venue_id: string | null;
  status: MeetingRequestStatus;
  proposed_time: string | null;
  message: string | null;
  meeting_window_preference: string | null;
  duration_minutes: number | null; // From 024 migration - default 60
  created_at: string;
  updated_at: string;
  sender?: Profile | null;
  receiver?: Profile | null;
  venue?: Venue | null;
}
