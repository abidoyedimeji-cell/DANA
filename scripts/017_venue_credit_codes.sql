-- Venue credit codes: one per date_invite, revealed when meet form is submitted.
-- Valid from 3 hours before event start; expires 30 minutes after reveal (2.5 hours before start).

CREATE TABLE IF NOT EXISTS public.venue_credit_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_invite_id UUID NOT NULL REFERENCES public.date_invites(id) ON DELETE CASCADE UNIQUE,
  code TEXT NOT NULL,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  event_start TIMESTAMPTZ,
  valid_from TIMESTAMPTZ NOT NULL,
  valid_until TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure expected columns exist if table was created previously with a different schema.
ALTER TABLE public.venue_credit_codes
  ADD COLUMN IF NOT EXISTS code TEXT;

ALTER TABLE public.venue_credit_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_credit_codes_select_own_invite" ON public.venue_credit_codes;
CREATE POLICY "venue_credit_codes_select_own_invite"
  ON public.venue_credit_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.date_invites di
      WHERE di.id = date_invite_id AND (di.inviter_id = auth.uid() OR di.invitee_id = auth.uid())
    )
  );

DROP POLICY IF EXISTS "venue_credit_codes_insert_participants" ON public.venue_credit_codes;
CREATE POLICY "venue_credit_codes_insert_participants"
  ON public.venue_credit_codes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.date_invites di
      WHERE di.id = date_invite_id AND (di.inviter_id = auth.uid() OR di.invitee_id = auth.uid())
    )
  );

CREATE INDEX IF NOT EXISTS idx_venue_credit_codes_date_invite ON public.venue_credit_codes(date_invite_id);
CREATE INDEX IF NOT EXISTS idx_venue_credit_codes_code ON public.venue_credit_codes(code);
