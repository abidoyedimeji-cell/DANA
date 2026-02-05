-- 023_meeting_requests.sql
-- High-Intent Connection Engine: Meeting Requests (not follower-based)

BEGIN;

-- Extend connections table with intent and venue context
ALTER TABLE public.connections
ADD COLUMN IF NOT EXISTS intent_type TEXT CHECK (intent_type IN ('social', 'business_mentorship', 'business_investing', 'business_networking')),
ADD COLUMN IF NOT EXISTS venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS proposed_time TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS message TEXT,
ADD COLUMN IF NOT EXISTS meeting_window_preference TEXT; -- e.g., "Tue/Wed 8am-10am"

-- Create meeting_requests table for more detailed request tracking
CREATE TABLE IF NOT EXISTS public.meeting_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  intent_type TEXT NOT NULL CHECK (intent_type IN ('social', 'business_mentorship', 'business_investing', 'business_networking')),
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled')),
  proposed_time TIMESTAMPTZ,
  message TEXT,
  meeting_window_preference TEXT, -- e.g., "Monday Mornings" or "Thursday Afternoons"
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(sender_id, receiver_id, intent_type, status) -- Prevent duplicate pending requests
);

ALTER TABLE public.meeting_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for meeting_requests
DROP POLICY IF EXISTS "meeting_requests_select_own" ON public.meeting_requests;
CREATE POLICY "meeting_requests_select_own" ON public.meeting_requests FOR SELECT 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "meeting_requests_insert_own" ON public.meeting_requests;
CREATE POLICY "meeting_requests_insert_own" ON public.meeting_requests FOR INSERT 
  WITH CHECK (auth.uid() = sender_id);

DROP POLICY IF EXISTS "meeting_requests_update_relevant" ON public.meeting_requests;
CREATE POLICY "meeting_requests_update_relevant" ON public.meeting_requests FOR UPDATE 
  USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_meeting_requests_receiver_status 
ON public.meeting_requests(receiver_id, status);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_sender 
ON public.meeting_requests(sender_id);

CREATE INDEX IF NOT EXISTS idx_meeting_requests_intent 
ON public.meeting_requests(intent_type);

-- Index on connections for intent filtering
CREATE INDEX IF NOT EXISTS idx_connections_intent 
ON public.connections(intent_type);

COMMENT ON TABLE public.meeting_requests IS 'High-intent connection requests with venue and availability context. Not follower-based.';
COMMENT ON COLUMN public.meeting_requests.intent_type IS 'Type of meeting: social (dating/casual) or business (mentorship/investing/networking)';
COMMENT ON COLUMN public.meeting_requests.meeting_window_preference IS 'Preferred meeting windows from receiver availability (e.g., "Tue/Wed 8am-10am")';

COMMIT;
