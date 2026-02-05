-- Dana App Database Schema
-- Part 6: Date Invites and Bookings

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  image_url TEXT,
  category TEXT,
  price_range TEXT,
  rating DECIMAL(2,1),
  is_partner BOOLEAN DEFAULT FALSE,
  promo_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policy to avoid "already exists" error
DROP POLICY IF EXISTS "venues_select_all" ON public.venues;
CREATE POLICY "venues_select_all" ON public.venues FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.date_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inviter_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  invitee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  venue_id UUID REFERENCES public.venues(id) ON DELETE SET NULL,
  proposed_date DATE NOT NULL,
  proposed_time TIME NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'cancelled', 'completed')),
  inviter_paid BOOLEAN DEFAULT FALSE,
  invitee_paid BOOLEAN DEFAULT FALSE,
  deposit_amount DECIMAL(10,2) DEFAULT 5.00,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.date_invites ENABLE ROW LEVEL SECURITY;

-- Drop and recreate policies to avoid "already exists" errors
DROP POLICY IF EXISTS "invites_select_own" ON public.date_invites;
CREATE POLICY "invites_select_own" ON public.date_invites FOR SELECT 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "invites_insert_own" ON public.date_invites;
CREATE POLICY "invites_insert_own" ON public.date_invites FOR INSERT 
  WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "invites_update_relevant" ON public.date_invites;
CREATE POLICY "invites_update_relevant" ON public.date_invites FOR UPDATE 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);
