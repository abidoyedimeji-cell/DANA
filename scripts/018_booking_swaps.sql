-- Booking swaps: change time or venue after confirm. £1.99 fee (inviter only). Deposit stays held.

CREATE TABLE IF NOT EXISTS public.booking_swaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_invite_id UUID NOT NULL REFERENCES public.date_invites(id) ON DELETE CASCADE,
  previous_venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  previous_time_slot TSTZRANGE,
  new_venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  new_time_slot TSTZRANGE NOT NULL,
  new_proposed_date DATE,
  new_proposed_time TIME,
  fee_charged DECIMAL(10, 2) DEFAULT 1.99,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.booking_swaps ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_swaps_select_participants" ON public.booking_swaps;
CREATE POLICY "booking_swaps_select_participants"
  ON public.booking_swaps FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.date_invites di
      WHERE di.id = date_invite_id AND (di.inviter_id = auth.uid() OR di.invitee_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_booking_swaps_date_invite ON public.booking_swaps(date_invite_id);

-- Check if swap is allowed: booking must be confirmed (dana_events row exists), within 24h of event.
CREATE OR REPLACE FUNCTION public.can_swap_booking(
  p_date_invite_id UUID,
  p_new_venue_id UUID,
  p_new_time_slot TSTZRANGE DEFAULT NULL
)
RETURNS TABLE (allowed BOOLEAN, message TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev public.dana_events%ROWTYPE;
  inv public.date_invites%ROWTYPE;
  event_start TIMESTAMPTZ;
  hours_until INTEGER;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Not authenticated'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_date_invite_id;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invite not found'::TEXT;
    RETURN;
  END IF;

  IF auth.uid() <> inv.inviter_id AND auth.uid() <> inv.invitee_id THEN
    RETURN QUERY SELECT FALSE, 'Not a participant'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO ev
  FROM public.dana_events
  WHERE date_invite_id = p_date_invite_id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Booking not confirmed yet'::TEXT;
    RETURN;
  END IF;

  event_start := lower(ev.time_slot);
  hours_until := EXTRACT(EPOCH FROM (event_start - NOW())) / 3600;

  IF hours_until < 24 THEN
    RETURN QUERY SELECT FALSE, 'Swap not allowed within 24 hours of the event'::TEXT;
    RETURN;
  END IF;

  RETURN QUERY SELECT TRUE, 'Swap allowed. £1.99 fee (inviter only).'::TEXT;
END;
$$;

-- Execute swap: update date_invites and dana_events; create booking_swaps row. Caller must charge £1.99 separately.
CREATE OR REPLACE FUNCTION public.execute_booking_swap(
  p_date_invite_id UUID,
  p_new_venue_id UUID,
  p_new_time_slot TSTZRANGE,
  p_new_proposed_date DATE DEFAULT NULL,
  p_new_proposed_time TIME DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
  ev public.dana_events%ROWTYPE;
  swap_id UUID;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_date_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF auth.uid() <> inv.inviter_id THEN
    RAISE EXCEPTION 'Only the inviter can execute the swap';
  END IF;

  SELECT * INTO ev
  FROM public.dana_events
  WHERE date_invite_id = p_date_invite_id
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not confirmed';
  END IF;

  IF EXTRACT(EPOCH FROM (lower(ev.time_slot) - NOW())) / 3600 < 24 THEN
    RAISE EXCEPTION 'Swap not allowed within 24 hours of the event';
  END IF;

  INSERT INTO public.booking_swaps (
    date_invite_id,
    previous_venue_id,
    previous_time_slot,
    new_venue_id,
    new_time_slot,
    new_proposed_date,
    new_proposed_time,
    fee_charged
  )
  VALUES (
    p_date_invite_id,
    ev.venue_id,
    ev.time_slot,
    p_new_venue_id,
    p_new_time_slot,
    COALESCE(p_new_proposed_date, (lower(p_new_time_slot))::date),
    COALESCE(p_new_proposed_time, (lower(p_new_time_slot))::time),
    1.99
  )
  RETURNING id INTO swap_id;

  UPDATE public.date_invites
  SET
    venue_id = p_new_venue_id,
    proposed_date = COALESCE(p_new_proposed_date, (lower(p_new_time_slot))::date),
    proposed_time = COALESCE(p_new_proposed_time, (lower(p_new_time_slot))::time),
    updated_at = NOW()
  WHERE id = p_date_invite_id;

  UPDATE public.dana_events
  SET
    venue_id = p_new_venue_id,
    time_slot = p_new_time_slot,
    created_at = NOW()
  WHERE date_invite_id = p_date_invite_id;

  RETURN swap_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_swap_booking(UUID, UUID, TSTZRANGE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_booking_swap(UUID, UUID, TSTZRANGE, DATE, TIME) TO authenticated;
