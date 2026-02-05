-- Indexes for date_invites and venues (discovery + list by user)
CREATE INDEX IF NOT EXISTS idx_date_invites_inviter ON public.date_invites(inviter_id);
CREATE INDEX IF NOT EXISTS idx_date_invites_invitee ON public.date_invites(invitee_id);
CREATE INDEX IF NOT EXISTS idx_date_invites_status ON public.date_invites(status);
CREATE INDEX IF NOT EXISTS idx_date_invites_proposed_date ON public.date_invites(proposed_date);

CREATE INDEX IF NOT EXISTS idx_venues_category ON public.venues(category);
CREATE INDEX IF NOT EXISTS idx_venues_is_partner ON public.venues(is_partner);
CREATE INDEX IF NOT EXISTS idx_venues_created_at ON public.venues(created_at DESC);
