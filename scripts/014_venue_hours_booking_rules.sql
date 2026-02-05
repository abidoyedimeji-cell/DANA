-- Venue onboarding + booking availability (Phase: venue hours & rules)

-- Venue hours by day of week (0 = Sunday)
CREATE TABLE IF NOT EXISTS public.venue_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at TIME NOT NULL,
  closes_at TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, day_of_week)
);

ALTER TABLE public.venue_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_hours_select_all" ON public.venue_hours;
CREATE POLICY "venue_hours_select_all" ON public.venue_hours FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_venue_hours_venue_day
ON public.venue_hours(venue_id, day_of_week);

-- Venue booking rules (capacity, turn time, timezone)
CREATE TABLE IF NOT EXISTS public.venue_booking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  turn_minutes INTEGER NOT NULL DEFAULT 90 CHECK (turn_minutes >= 30),
  last_seating_time TIME NOT NULL DEFAULT '21:00',
  enabled_booking_types TEXT[] NOT NULL DEFAULT ARRAY['timed_table'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venue_booking_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_booking_rules_select_all" ON public.venue_booking_rules;
CREATE POLICY "venue_booking_rules_select_all" ON public.venue_booking_rules FOR SELECT USING (true);

-- Reservation holds (optional)
CREATE TABLE IF NOT EXISTS public.reservation_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('timed_table', 'timed_room')),
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  time_slot TSTZRANGE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reservation_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_holds_select_all" ON public.reservation_holds;
CREATE POLICY "reservation_holds_select_all" ON public.reservation_holds FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_venue
ON public.reservation_holds(venue_id);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_time_slot
ON public.reservation_holds USING gist (time_slot);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_expires
ON public.reservation_holds(expires_at);

-- Reservations (confirmed bookings)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('walk_in', 'timed_table', 'timed_room')),
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  time_slot TSTZRANGE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select_all" ON public.reservations;
CREATE POLICY "reservations_select_all" ON public.reservations FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_reservations_venue
ON public.reservations(venue_id);

CREATE INDEX IF NOT EXISTS idx_reservations_time_slot
ON public.reservations USING gist (time_slot);

-- Availability RPC: returns true/false based on hours, rules, and capacity
CREATE OR REPLACE FUNCTION public.check_availability(
  venue_id UUID,
  start_at TIMESTAMPTZ,
  party_size INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rules public.venue_booking_rules%ROWTYPE;
  venue_day SMALLINT;
  local_start TIMESTAMP;
  local_end TIMESTAMP;
  hours public.venue_hours%ROWTYPE;
  active_count INTEGER;
BEGIN
  SELECT * INTO rules
  FROM public.venue_booking_rules
  WHERE venue_booking_rules.venue_id = check_availability.venue_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking rules not found for venue';
  END IF;

  local_start := (start_at AT TIME ZONE rules.timezone);
  local_end := local_start + make_interval(mins => rules.turn_minutes);
  venue_day := EXTRACT(DOW FROM local_start);

  SELECT * INTO hours
  FROM public.venue_hours
  WHERE venue_hours.venue_id = check_availability.venue_id
    AND venue_hours.day_of_week = venue_day;

  IF NOT FOUND OR hours.is_closed THEN
    RETURN FALSE;
  END IF;

  IF local_start::time < hours.opens_at
     OR local_end::time > hours.closes_at
     OR local_start::time > rules.last_seating_time THEN
    RETURN FALSE;
  END IF;

  SELECT
    COALESCE(SUM(r.party_size), 0)
  INTO active_count
  FROM public.reservations r
  WHERE r.venue_id = check_availability.venue_id
    AND r.status = 'confirmed'
    AND r.time_slot && tstzrange(start_at, start_at + make_interval(mins => rules.turn_minutes), '[)');

  SELECT
    active_count + COALESCE(SUM(h.party_size), 0)
  INTO active_count
  FROM public.reservation_holds h
  WHERE h.venue_id = check_availability.venue_id
    AND h.expires_at > NOW()
    AND h.time_slot && tstzrange(start_at, start_at + make_interval(mins => rules.turn_minutes), '[)');

  RETURN (active_count + party_size) <= rules.capacity;
END;
$$;
