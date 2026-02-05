/**
 * Availability Guard - Prevents double-booking and validates time slots
 * 
 * TRIPLE-CHECK VALIDATION:
 * 1. User Calendar (External): Personal/Professional bandwidth - respects life outside DANA
 * 2. Venue Hours: Physical location access - prevents arriving at closed venues
 * 3. DANA Internal: Platform integrity - prevents "Platform Burnout" from double-booked slots
 * 
 * MUTUAL AVAILABILITY:
 * When User A requests a meeting with User B, the system checks BOTH calendars.
 * This eliminates the "let me check my calendar" dance entirely.
 * 
 * BUFFER LOGIC:
 * 15-minute buffer applies to BOTH users to prevent back-to-back meetings.
 * If User A has a meeting ending at 2:00 PM, they can't request a meeting at 2:00 PM.
 */
import { addMinutes, subMinutes, areIntervalsOverlapping } from 'date-fns';
import { supabase } from "@/lib/supabase";
import { fetchExternalCalendarSlots, intersectWithVenueHours, getFilteredSlots, isSlotWithinVenueHours, type AvailabilityView, type ConflictInterval } from "shared";
import type { Profile } from "shared";

/**
 * Get calendar conflicts for a user (checks DANA internal + external calendar)
 * Handles DATE + TIME fragmentation from date_invites table
 * 
 * MUTUAL AVAILABILITY: Checks BOTH sides of relationships:
 * - meeting_requests: receiver_id OR sender_id
 * - date_invites: invitee_id OR inviter_id
 * 
 * This ensures we catch conflicts whether the user is the requester or receiver.
 */
export async function getCalendarConflicts(
  userId: string,
  targetDate: Date,
  profile?: Profile | null
): Promise<ConflictInterval[]> {
  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const conflicts: ConflictInterval[] = [];

  // 1. Fetch DANA internal conflicts (accepted meeting_requests)
  // Check BOTH where user is receiver AND sender (mutual availability)
  const { data: professional } = await supabase
    .from("meeting_requests")
    .select("proposed_time, duration_minutes")
    .or(`receiver_id.eq.${userId},sender_id.eq.${userId}`)
    .eq("status", "accepted")
    .gte("proposed_time", startOfDay.toISOString())
    .lte("proposed_time", endOfDay.toISOString());

  if (professional) {
    professional.forEach((m) => {
      const start = new Date(m.proposed_time);
      const duration = m.duration_minutes || 60;
      const end = new Date(start.getTime() + duration * 60 * 1000);
      conflicts.push({ start, end });
    });
  }

  // 2. Fetch DANA social conflicts (accepted date_invites)
  // Check BOTH where user is invitee AND inviter (mutual availability)
  // Handle DATE + TIME fragmentation by combining them
  const { data: social } = await supabase
    .from("date_invites")
    .select("proposed_date, proposed_time, duration_minutes")
    .or(`invitee_id.eq.${userId},inviter_id.eq.${userId}`)
    .in("status", ["accepted", "completed"])
    .gte("proposed_date", startOfDay.toISOString().split("T")[0])
    .lte("proposed_date", endOfDay.toISOString().split("T")[0]);

  if (social) {
    social.forEach((s) => {
      // Combine DATE + TIME into full timestamp (assumes local timezone)
      const dateStr = s.proposed_date;
      const timeStr = s.proposed_time;
      // Create date in local timezone
      const [year, month, day] = dateStr.split('-').map(Number);
      const [hours, minutes, seconds] = timeStr.split(':').map(Number);
      const combined = new Date(year, month - 1, day, hours, minutes, seconds || 0);
      
      const duration = s.duration_minutes || 90;
      const end = new Date(combined.getTime() + duration * 60 * 1000);
      conflicts.push({ start: combined, end });
    });
  }

  return conflicts;
}

/**
 * Check if a proposed time conflicts with existing commitments
 * Uses date-fns for robust interval collision detection.
 * Includes 15-minute buffer to prevent back-to-back meetings
 * 
 * @param proposedTime - The start time of the proposed meeting
 * @param conflicts - Array of existing conflict intervals
 * @param meetingDurationMinutes - Duration of the proposed meeting (default 60)
 */
export function isTimeSlotBusy(
  proposedTime: Date,
  conflicts: ConflictInterval[],
  meetingDurationMinutes: number = 60
): boolean {
  const bufferMinutes = 15; // 15-minute buffer on both sides
  
  // Define the interval for the proposed meeting (including buffers)
  const proposedInterval = {
    start: subMinutes(proposedTime, bufferMinutes),
    end: addMinutes(proposedTime, meetingDurationMinutes + bufferMinutes)
  };

  return conflicts.some((conflict) =>
    areIntervalsOverlapping(
      proposedInterval,
      { start: conflict.start, end: conflict.end },
      { inclusive: true } // Ensures back-to-back buffer collisions are caught
    )
  );
}

/**
 * Get available time slots (hybrid: external calendar + DANA conflicts + venue hours)
 * Falls back to manual time proposal if calendar link is missing or fails
 * 
 * MUTUAL AVAILABILITY: Checks both receiver AND requester availability
 * to eliminate the "let me check my calendar" dance entirely.
 * 
 * @param view - Perspective view: 'both' (mutual), 'userB' (receiver only), 'userA' (requester only)
 */
export async function getAvailableSlots(
  receiverId: string,
  targetDate: Date,
  mode: 'business' | 'social',
  receiverProfile?: Profile | null,
  venueHours?: { opens_at: string; closes_at: string } | null,
  requesterId?: string | null,
  requesterProfile?: Profile | null,
  view: AvailabilityView = 'both'
): Promise<Date[]> {
  // Path A: External calendar sync (if link exists)
  const calendarLink = mode === 'business' 
    ? receiverProfile?.calendar_link_business 
    : receiverProfile?.calendar_link_social;

  if (calendarLink) {
    try {
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      const externalSlots = await fetchExternalCalendarSlots(
        calendarLink,
        mode,
        startOfDay,
        endOfDay
      );

      // Intersect with venue hours
      const venueFiltered = intersectWithVenueHours(externalSlots, venueHours ?? null);

      // MUTUAL AVAILABILITY CHECK: Get conflicts for BOTH receiver and requester
      const receiverConflicts = await getCalendarConflicts(receiverId, targetDate, receiverProfile);
      const requesterConflicts = requesterId 
        ? await getCalendarConflicts(requesterId, targetDate, requesterProfile)
        : [];

      // Filter slots based on perspective view using shared utility
      const meetingDuration = 60; // Default duration for calendar-synced slots
      const candidateSlots = venueFiltered.map((slot) => slot.start);
      
      const filtered = getFilteredSlots(
        candidateSlots,
        requesterConflicts,
        receiverConflicts,
        venueHours ?? null,
        view,
        meetingDuration,
        isTimeSlotBusy
      );

      if (filtered.length > 0) {
        return filtered;
      }
    } catch (error) {
      console.error('External calendar fetch failed, falling back to manual:', error);
      // Fall through to Path B
    }
  }

  // Path B: Manual time proposal (fallback)
  // Generate hourly slots based on venue hours or defaults
  const slots: Date[] = [];
  let startHour = 9;
  let endHour = 21;

  if (venueHours) {
    startHour = parseInt(venueHours.opens_at.split(':')[0]);
    endHour = parseInt(venueHours.closes_at.split(':')[0]);
  }

  // MUTUAL AVAILABILITY CHECK: Get conflicts for BOTH users
  const receiverConflicts = await getCalendarConflicts(receiverId, targetDate, receiverProfile);
  const requesterConflicts = requesterId 
    ? await getCalendarConflicts(requesterId, targetDate, requesterProfile)
    : [];

  // Generate hourly slots, ensuring each slot accounts for meeting duration
  // Default 60-minute meetings, but check against actual conflict durations
  const defaultMeetingDuration = 60; // Default duration for manual slots
  for (let hour = startHour; hour < endHour; hour++) {
    const slot = new Date(targetDate);
    slot.setHours(hour, 0, 0, 0);
    slots.push(slot);
  }

  // Filter slots based on perspective view using shared utility
  return getFilteredSlots(
    slots,
    requesterConflicts,
    receiverConflicts,
    venueHours ?? null,
    view,
    defaultMeetingDuration,
    isTimeSlotBusy
  );
}
