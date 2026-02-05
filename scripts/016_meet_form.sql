-- Meet form: completions table and window RPC.
-- Window: 15 minutes before event start -> 60 minutes after event end (90 min meeting).

CREATE TABLE IF NOT EXISTS public.meet_form_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_invite_id UUID NOT NULL REFERENCES public.date_invites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  answers JSONB DEFAULT '{}',
  UNIQUE(date_invite_id, user_id)
);

ALTER TABLE public.meet_form_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "meet_form_completions_select_participants" ON public.meet_form_completions;
CREATE POLICY "meet_form_completions_select_participants"
  ON public.meet_form_completions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.date_invites di
      WHERE di.id = date_invite_id AND (di.inviter_id = auth.uid() OR di.invitee_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "meet_form_completions_insert_participants" ON public.meet_form_completions;
CREATE POLICY "meet_form_completions_insert_participants"
  ON public.meet_form_completions FOR INSERT
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM public.date_invites di
      WHERE di.id = date_invite_id AND (di.inviter_id = auth.uid() OR di.invitee_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_meet_form_completions_date_invite ON public.meet_form_completions(date_invite_id);

-- Returns true if current time is within [event_start - 15 min, event_end + 60 min].
-- Event times from dana_events.time_slot if linked, else from date_invites proposed_date + proposed_time (90 min duration).
CREATE OR REPLACE FUNCTION public.meet_form_window_open(p_date_invite_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ev public.dana_events%ROWTYPE;
  inv public.date_invites%ROWTYPE;
  window_start TIMESTAMPTZ;
  window_end TIMESTAMPTZ;
  slot_start TIMESTAMPTZ;
  slot_end TIMESTAMPTZ;
BEGIN
  -- Must be inviter or invitee
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_date_invite_id;

  IF NOT FOUND THEN
    RETURN FALSE;
  END IF;

  IF auth.uid() <> inv.inviter_id AND auth.uid() <> inv.invitee_id THEN
    RETURN FALSE;
  END IF;

  -- Prefer dana_events.time_slot if event exists
  SELECT * INTO ev
  FROM public.dana_events
  WHERE date_invite_id = p_date_invite_id
  LIMIT 1;

  IF FOUND AND ev.time_slot IS NOT NULL THEN
    slot_start := lower(ev.time_slot);
    slot_end := upper(ev.time_slot);
  ELSE
    -- Build from date_invites (proposed_date + proposed_time, 90 min duration)
    slot_start := (inv.proposed_date + inv.proposed_time) AT TIME ZONE 'UTC';
    slot_end := slot_start + interval '90 minutes';
  END IF;

  window_start := slot_start - interval '15 minutes';
  window_end := slot_end + interval '60 minutes';

  RETURN (NOW() >= window_start AND NOW() <= window_end);
END;
$$;

GRANT EXECUTE ON FUNCTION public.meet_form_window_open(UUID) TO authenticated;
