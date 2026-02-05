-- DANA availability + intersection + holds + events (Phase 1)
-- Requires btree_gist for UUID EXCLUDE constraints.

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------
-- User availability blocks
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.dana_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  slot_type TEXT DEFAULT 'one-off' CHECK (slot_type IN ('one-off', 'recurring')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (user_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_availability_select_own" ON public.dana_availability;
CREATE POLICY "dana_availability_select_own"
ON public.dana_availability FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_insert_own" ON public.dana_availability;
CREATE POLICY "dana_availability_insert_own"
ON public.dana_availability FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_update_own" ON public.dana_availability;
CREATE POLICY "dana_availability_update_own"
ON public.dana_availability FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_delete_own" ON public.dana_availability;
CREATE POLICY "dana_availability_delete_own"
ON public.dana_availability FOR DELETE
USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dana_availability_time_slot
ON public.dana_availability USING gist (time_slot);

-- ------------------------------
-- Venue exclusive window
-- Optional: special/limited-access window only. Do NOT use as core venue availability.
-- Core open/close = venue_hours; duration/lead time = venue_booking_rules; intersection
-- should filter by venue_hours open then create hold/event.
-- ------------------------------
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS exclusive_window TSTZRANGE;

-- ------------------------------
-- Intersection RPC. Uses exclusive_window only when set (special/limited access).
-- For normal OpenTable-style flow: use user overlap (A ∩ B), snap to slots from
-- venue_booking_rules, filter by venue_hours open, then create hold/event.
-- ------------------------------
CREATE OR REPLACE FUNCTION public.get_dana_intersection(
  host_id UUID,
  guest_id UUID,
  target_venue_id UUID,
  meeting_duration INTERVAL DEFAULT '90 minutes'
)
RETURNS TABLE (meeting_window TSTZRANGE)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT (a.time_slot * b.time_slot * v.exclusive_window) AS meeting_window
  FROM public.dana_availability a
  JOIN public.dana_availability b ON a.time_slot && b.time_slot
  JOIN public.venues v ON v.id = target_venue_id
  WHERE a.user_id = host_id
    AND b.user_id = guest_id
    AND v.exclusive_window IS NOT NULL
    AND (a.time_slot * b.time_slot * v.exclusive_window) IS NOT NULL
    AND upper(a.time_slot * b.time_slot * v.exclusive_window)
        - lower(a.time_slot * b.time_slot * v.exclusive_window) >= meeting_duration;
END;
$$;

-- ------------------------------
-- Holds (venue-level)
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.dana_table_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (venue_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_table_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_table_holds_select_participants" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_select_participants"
ON public.dana_table_holds FOR SELECT
USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "dana_table_holds_insert_participants" ON public.dana_table_holds;
DROP POLICY IF EXISTS "dana_table_holds_insert_host_only" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_insert_host_only"
ON public.dana_table_holds FOR INSERT
WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "dana_table_holds_delete_participants" ON public.dana_table_holds;
DROP POLICY IF EXISTS "dana_table_holds_delete_host_only" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_delete_host_only"
ON public.dana_table_holds FOR DELETE
USING (auth.uid() = host_id);

CREATE INDEX IF NOT EXISTS idx_dana_table_holds_expires
ON public.dana_table_holds (expires_at);

-- ------------------------------
-- Confirmed events (venue-level)
-- ------------------------------
CREATE TABLE IF NOT EXISTS public.dana_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  date_invite_id UUID REFERENCES public.date_invites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (venue_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_events_select_participants" ON public.dana_events;
CREATE POLICY "dana_events_select_participants"
ON public.dana_events FOR SELECT
USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "dana_events_insert_participants" ON public.dana_events;
CREATE POLICY "dana_events_insert_participants"
ON public.dana_events FOR INSERT
WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

-- ------------------------------
-- Hold + confirm RPCs
-- ------------------------------
CREATE OR REPLACE FUNCTION public.create_dana_hold(
  host_id UUID,
  guest_id UUID,
  venue_id UUID,
  time_slot TSTZRANGE,
  meeting_duration INTERVAL DEFAULT '90 minutes',
  hold_ttl INTERVAL DEFAULT '5 minutes'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hold_id UUID;
BEGIN
  -- Ensure the requested slot is long enough.
  IF upper(time_slot) - lower(time_slot) < meeting_duration THEN
    RAISE EXCEPTION 'Requested time slot is shorter than meeting duration';
  END IF;

  -- Ensure requested slot is inside a valid intersection window.
  IF NOT EXISTS (
    SELECT 1
    FROM public.get_dana_intersection(host_id, guest_id, venue_id, meeting_duration) AS mw
    WHERE time_slot <@ mw.meeting_window
  ) THEN
    RAISE EXCEPTION 'Requested time slot is not in an available intersection window';
  END IF;

  -- Ensure no confirmed event overlaps.
  IF EXISTS (
    SELECT 1 FROM public.dana_events e
    WHERE e.venue_id = venue_id AND e.time_slot && time_slot
  ) THEN
    RAISE EXCEPTION 'Requested time slot overlaps an existing event';
  END IF;

  INSERT INTO public.dana_table_holds (venue_id, host_id, guest_id, time_slot, expires_at)
  VALUES (venue_id, host_id, guest_id, time_slot, NOW() + hold_ttl)
  RETURNING id INTO hold_id;

  RETURN hold_id;
END;
$$;

DROP FUNCTION IF EXISTS public.confirm_dana_booking(UUID, UUID);
CREATE OR REPLACE FUNCTION public.confirm_dana_booking(
  hold_id UUID,
  p_date_invite_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hold_row public.dana_table_holds%ROWTYPE;
  invite_row public.date_invites%ROWTYPE;
  event_id UUID;
BEGIN
  IF p_date_invite_id IS NULL THEN
    RAISE EXCEPTION 'date_invite_id is required';
  END IF;

  -- Lock the hold row so two confirms can't race
  SELECT * INTO hold_row
  FROM public.dana_table_holds
  WHERE id = hold_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hold not found';
  END IF;

  IF hold_row.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Hold has expired';
  END IF;

  -- Load the invite
  SELECT * INTO invite_row
  FROM public.date_invites
  WHERE id = p_date_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  -- Invite must match hold participants (either direction)
  IF NOT (
    (invite_row.inviter_id = hold_row.host_id AND invite_row.invitee_id = hold_row.guest_id)
    OR
    (invite_row.inviter_id = hold_row.guest_id AND invite_row.invitee_id = hold_row.host_id)
  ) THEN
    RAISE EXCEPTION 'Invite does not match hold participants';
  END IF;

  -- BOTH must have paid before confirmation
  IF COALESCE(invite_row.inviter_paid, FALSE) <> TRUE
     OR COALESCE(invite_row.invitee_paid, FALSE) <> TRUE THEN
    RAISE EXCEPTION 'Both parties must pay before confirmation';
  END IF;

  -- Only INVITER can confirm
  IF auth.uid() IS NULL OR auth.uid() <> invite_row.inviter_id THEN
    RAISE EXCEPTION 'Only the inviter can confirm';
  END IF;

  -- Create the event linked to the invite
  INSERT INTO public.dana_events (venue_id, host_id, guest_id, time_slot, date_invite_id)
  VALUES (hold_row.venue_id, hold_row.host_id, hold_row.guest_id, hold_row.time_slot, p_date_invite_id)
  RETURNING id INTO event_id;

  -- Mark invite accepted
  UPDATE public.date_invites
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_date_invite_id;

  -- Remove hold
  DELETE FROM public.dana_table_holds WHERE id = hold_id;

  RETURN event_id;
END;
$$;

-- Payment flags (call after Stripe/checkout succeeds; no real money here)
CREATE OR REPLACE FUNCTION public.mark_inviter_paid(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> inv.inviter_id THEN
    RAISE EXCEPTION 'Only the inviter can mark inviter_paid';
  END IF;

  IF inv.status IN ('declined', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Cannot pay for an invite in status %', inv.status;
  END IF;

  IF COALESCE(inv.invitee_paid, FALSE) = TRUE AND COALESCE(inv.inviter_paid, FALSE) = FALSE THEN
    RAISE EXCEPTION 'Invitee already paid; inviter should have paid first (data inconsistent)';
  END IF;

  UPDATE public.date_invites
  SET inviter_paid = TRUE, updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_invitee_paid(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> inv.invitee_id THEN
    RAISE EXCEPTION 'Only the invitee can mark invitee_paid';
  END IF;

  IF inv.status IN ('declined', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Cannot pay for an invite in status %', inv.status;
  END IF;

  IF COALESCE(inv.inviter_paid, FALSE) <> TRUE THEN
    RAISE EXCEPTION 'Inviter must pay first';
  END IF;

  UPDATE public.date_invites
  SET invitee_paid = TRUE, updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_inviter_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_invitee_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_dana_booking(UUID, UUID) TO authenticated;
