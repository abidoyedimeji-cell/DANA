/**
 * Calendar Sync Utility - Fetches availability from external calendar links
 * Supports Cal.com, Calendly, and generic iCal feeds
 */

export interface CalendarSlot {
  start: Date;
  end: Date;
  available: boolean;
}

/**
 * Detect calendar provider from URL
 */
export function detectCalendarProvider(url: string): 'cal_com' | 'calendly' | 'ical' | 'unknown' {
  if (url.includes('cal.com') || url.includes('calendly.com')) {
    return url.includes('cal.com') ? 'cal_com' : 'calendly';
  }
  if (url.includes('.ics') || url.includes('ical')) {
    return 'ical';
  }
  return 'unknown';
}

/**
 * Fetch available slots from Cal.com API
 */
async function fetchCalComSlots(link: string, startDate: Date, endDate: Date): Promise<CalendarSlot[]> {
  // Cal.com API format: https://api.cal.com/v1/availability?username=xxx&dateFrom=xxx&dateTo=xxx
  // Extract username from link
  const match = link.match(/cal\.com\/([^\/]+)/);
  if (!match) throw new Error('Invalid Cal.com link');
  
  const username = match[1];
  const apiUrl = `https://api.cal.com/v1/availability?username=${username}&dateFrom=${startDate.toISOString()}&dateTo=${endDate.toISOString()}`;
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error('Cal.com API error');
    const data = await response.json();
    
    // Cal.com returns slots in format: { slots: [{ time: "2024-01-01T10:00:00Z" }] }
    return (data.slots || []).map((slot: any) => ({
      start: new Date(slot.time),
      end: new Date(new Date(slot.time).getTime() + 60 * 60 * 1000), // 1 hour default
      available: true,
    }));
  } catch (error) {
    console.error('Cal.com fetch failed:', error);
    return [];
  }
}

/**
 * Fetch available slots from Calendly API
 */
async function fetchCalendlySlots(link: string, startDate: Date, endDate: Date): Promise<CalendarSlot[]> {
  // Calendly API requires OAuth or webhook setup
  // For now, return empty and rely on fallback
  // TODO: Implement Calendly OAuth flow
  console.warn('Calendly integration not yet implemented, falling back to manual');
  return [];
}

/**
 * Fetch available slots from generic iCal feed
 */
async function fetchICalSlots(link: string, startDate: Date, endDate: Date): Promise<CalendarSlot[]> {
  // Parse iCal to find free slots
  // This is a simplified version - full iCal parsing would require a library
  try {
    const response = await fetch(link);
    if (!response.ok) throw new Error('iCal fetch failed');
    const icalText = await response.text();
    
    // Basic iCal parsing (simplified - would need proper library in production)
    // For now, return empty and rely on fallback
    console.warn('iCal parsing not yet implemented, falling back to manual');
    return [];
  } catch (error) {
    console.error('iCal fetch failed:', error);
    return [];
  }
}

/**
 * Main function: Fetch available slots from external calendar
 */
export async function fetchExternalCalendarSlots(
  calendarLink: string,
  mode: 'business' | 'social',
  startDate: Date,
  endDate: Date
): Promise<CalendarSlot[]> {
  if (!calendarLink) return [];
  
  const provider = detectCalendarProvider(calendarLink);
  
  switch (provider) {
    case 'cal_com':
      return fetchCalComSlots(calendarLink, startDate, endDate);
    case 'calendly':
      return fetchCalendlySlots(calendarLink, startDate, endDate);
    case 'ical':
      return fetchICalSlots(calendarLink, startDate, endDate);
    default:
      console.warn('Unknown calendar provider:', calendarLink);
      return [];
  }
}

/**
 * Intersect external calendar slots with venue hours
 */
export function intersectWithVenueHours(
  calendarSlots: CalendarSlot[],
  venueHours: { opens_at: string; closes_at: string } | null
): CalendarSlot[] {
  if (!venueHours) return calendarSlots;
  
  const opensHour = parseInt(venueHours.opens_at.split(':')[0]);
  const closesHour = parseInt(venueHours.closes_at.split(':')[0]);
  
  return calendarSlots.filter((slot) => {
    const slotHour = slot.start.getHours();
    return slotHour >= opensHour && slotHour < closesHour;
  });
}

/**
 * Check if a slot is within venue operating hours
 */
export function isSlotWithinVenueHours(
  slot: Date,
  venueHours: { opens_at: string; closes_at: string } | null
): boolean {
  if (!venueHours) return true;
  const opensHour = parseInt(venueHours.opens_at.split(':')[0]);
  const closesHour = parseInt(venueHours.closes_at.split(':')[0]);
  const slotHour = slot.getHours();
  return slotHour >= opensHour && slotHour < closesHour;
}

/**
 * Filter slots based on perspective view (Both, User B only, User A only)
 * Used for the AvailabilityController perspective switcher
 */
export interface ConflictInterval {
  start: Date;
  end: Date;
}

export type AvailabilityView = 'both' | 'userB' | 'userA';

export function getFilteredSlots(
  allSlots: Date[],
  conflictsA: ConflictInterval[],
  conflictsB: ConflictInterval[],
  venueHours: { opens_at: string; closes_at: string } | null,
  view: AvailabilityView,
  meetingDurationMinutes: number = 60,
  isTimeSlotBusy: (slot: Date, conflicts: ConflictInterval[], duration: number) => boolean
): Date[] {
  return allSlots.filter((slot) => {
    // Always check venue hours first
    if (!isSlotWithinVenueHours(slot, venueHours)) {
      return false;
    }

    const isBusyA = isTimeSlotBusy(slot, conflictsA, meetingDurationMinutes);
    const isBusyB = isTimeSlotBusy(slot, conflictsB, meetingDurationMinutes);

    switch (view) {
      case 'both':
        return !isBusyA && !isBusyB;
      case 'userB':
        return !isBusyB;
      case 'userA':
        return !isBusyA;
      default:
        return !isBusyA && !isBusyB;
    }
  });
}
