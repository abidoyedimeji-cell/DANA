-- Booking deposits: one row per party per confirmed booking. Filled by trigger on dana_events.
-- Status: held -> released_to_stripe (after 7 days, no dispute) or refunded / disputed.

CREATE TABLE IF NOT EXISTS public.booking_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date_invite_id UUID NOT NULL REFERENCES public.date_invites(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL DEFAULT 5.00,
  status TEXT NOT NULL DEFAULT 'held' CHECK (status IN ('held', 'released_to_stripe', 'refunded', 'disputed')),
  stripe_payment_intent_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ
);

-- Ensure expected columns exist if table was created previously with a different schema.
ALTER TABLE public.booking_deposits
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.booking_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_deposits_select_own" ON public.booking_deposits;
CREATE POLICY "booking_deposits_select_own"
  ON public.booking_deposits FOR SELECT
  USING (auth.uid() = user_id);

-- Service/trigger runs as definer; no insert/update policy for normal users (only trigger inserts).
CREATE INDEX IF NOT EXISTS idx_booking_deposits_date_invite ON public.booking_deposits(date_invite_id);
CREATE INDEX IF NOT EXISTS idx_booking_deposits_status_created ON public.booking_deposits(status, created_at);

-- When a dana_event is created (confirm_dana_booking), insert two booking_deposits rows.
CREATE OR REPLACE FUNCTION public.on_dana_event_created_insert_booking_deposits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
BEGIN
  IF NEW.date_invite_id IS NULL THEN
    RETURN NEW;
  END IF;

  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = NEW.date_invite_id;

  IF NOT FOUND THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.booking_deposits (date_invite_id, user_id, amount, status)
  VALUES
    (NEW.date_invite_id, inv.inviter_id, COALESCE(inv.deposit_amount, 5.00), 'held'),
    (NEW.date_invite_id, inv.invitee_id, COALESCE(inv.deposit_amount, 5.00), 'held');

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_dana_event_insert_booking_deposits ON public.dana_events;
CREATE TRIGGER after_dana_event_insert_booking_deposits
  AFTER INSERT ON public.dana_events
  FOR EACH ROW
  EXECUTE FUNCTION public.on_dana_event_created_insert_booking_deposits();
