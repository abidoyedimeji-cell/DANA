-- 024_calendar_optimization_and_durations.sql
-- Calendar Integration: Duration tracking and conflict detection optimization

BEGIN;

-- 1. Add duration tracking to professional requests
ALTER TABLE public.meeting_requests
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 60;

-- 2. Add duration tracking to social dates
ALTER TABLE public.date_invites
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 90;

-- 3. Add calendar link fields to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS calendar_link_business TEXT,
ADD COLUMN IF NOT EXISTS calendar_link_social TEXT,
ADD COLUMN IF NOT EXISTS availability_sync_provider TEXT DEFAULT 'link' 
  CHECK (availability_sync_provider IN ('link', 'google', 'outlook', 'calendly', 'cal_com'));

-- 4. Optimize Professional Indexes for conflict detection
CREATE INDEX IF NOT EXISTS idx_meeting_requests_overlap_check
ON public.meeting_requests (receiver_id, proposed_time)
WHERE status = 'accepted';

-- 5. Optimize Social Indexes for conflict detection
-- Since DATE and TIME are separate, we index both for the composite check
CREATE INDEX IF NOT EXISTS idx_date_invites_overlap_check
ON public.date_invites (invitee_id, proposed_date, proposed_time)
WHERE status IN ('accepted', 'completed');

COMMENT ON COLUMN public.profiles.calendar_link_business IS 'External calendar link for business meetings (Cal.com, Calendly, etc.)';
COMMENT ON COLUMN public.profiles.calendar_link_social IS 'External calendar link for social meetings';
COMMENT ON COLUMN public.profiles.availability_sync_provider IS 'Provider type for availability sync: link (manual URL), google, outlook, calendly, cal_com';
COMMENT ON COLUMN public.meeting_requests.duration_minutes IS 'Meeting duration in minutes (default 60)';
COMMENT ON COLUMN public.date_invites.duration_minutes IS 'Date duration in minutes (default 90)';

COMMIT;
