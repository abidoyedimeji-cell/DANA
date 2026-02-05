-- Event slots: venue availability for date discovery
CREATE TABLE IF NOT EXISTS public.event_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  slot_start TIMESTAMPTZ NOT NULL,
  slot_end TIMESTAMPTZ NOT NULL,
  max_guests INTEGER NOT NULL DEFAULT 2 CHECK (max_guests >= 1 AND max_guests <= 20),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.event_slots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "event_slots_select_all" ON public.event_slots;
CREATE POLICY "event_slots_select_all" ON public.event_slots FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_event_slots_venue ON public.event_slots(venue_id);
CREATE INDEX IF NOT EXISTS idx_event_slots_start ON public.event_slots(slot_start);
