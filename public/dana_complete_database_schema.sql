-- =====================================================
-- DANA APP - COMPLETE DATABASE SCHEMA
-- Version: 1.0
-- Generated: 2026-02-04
-- Platform: Supabase (PostgreSQL)
-- =====================================================
-- 
-- INSTRUCTIONS:
-- 1. Run this entire script in Supabase SQL Editor
-- 2. Run sections in order from top to bottom
-- 3. Some statements use IF NOT EXISTS for safety
--
-- =====================================================


-- =====================================================
-- SECTION 1: PROFILES TABLE WITH AUTO-CREATE TRIGGER
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  profile_image_url TEXT,
  age INTEGER,
  location TEXT,
  height TEXT,
  love_language TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  profile_mode TEXT DEFAULT 'dating' CHECK (profile_mode IN ('dating', 'business', 'both')),
  email TEXT,
  phone TEXT,
  first_name TEXT,
  gender TEXT,
  user_role TEXT DEFAULT 'user',
  subscription_tier TEXT DEFAULT 'free',
  postcode TEXT,
  occupation TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  email_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_all" ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_insert_authenticated" ON public.profiles;
CREATE POLICY "profiles_insert_authenticated" 
ON public.profiles FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.jwt() ->> 'role' = 'service_role'
);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
CREATE POLICY "profiles_delete_own" 
ON public.profiles FOR DELETE 
USING (auth.uid() = id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_postcode ON profiles(postcode);
CREATE INDEX IF NOT EXISTS idx_profiles_occupation ON profiles(occupation);
CREATE INDEX IF NOT EXISTS idx_profiles_age ON profiles(age);
CREATE INDEX IF NOT EXISTS idx_profiles_gender ON profiles(gender);
CREATE INDEX IF NOT EXISTS idx_profiles_email_verified ON profiles(email_verified);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, username, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    'free'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- =====================================================
-- SECTION 2: PROFILE PHOTOS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "photos_select_all" ON public.profile_photos;
CREATE POLICY "photos_select_all" ON public.profile_photos FOR SELECT USING (true);

DROP POLICY IF EXISTS "photos_insert_own" ON public.profile_photos;
CREATE POLICY "photos_insert_own" ON public.profile_photos FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "photos_update_own" ON public.profile_photos;
CREATE POLICY "photos_update_own" ON public.profile_photos FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "photos_delete_own" ON public.profile_photos;
CREATE POLICY "photos_delete_own" ON public.profile_photos FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- SECTION 3: USER PREFERENCES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  max_distance_miles INTEGER DEFAULT 25,
  preferred_locations TEXT[] DEFAULT '{}',
  open_to_children BOOLEAN DEFAULT TRUE,
  religion TEXT,
  religious_preference TEXT CHECK (religious_preference IN ('must_match', 'open', 'no_preference')),
  fitness_level TEXT,
  dietary_habits TEXT,
  smoking TEXT,
  drinking TEXT,
  hobbies TEXT[] DEFAULT '{}',
  available_days TEXT[] DEFAULT '{}',
  available_times TEXT[] DEFAULT '{}',
  budget_preference TEXT[],
  max_distance TEXT,
  dating_intentions TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preferences_select_own" ON public.user_preferences;
CREATE POLICY "preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_insert_own" ON public.user_preferences;
CREATE POLICY "preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_update_own" ON public.user_preferences;
CREATE POLICY "preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "preferences_delete_own" ON public.user_preferences;
CREATE POLICY "preferences_delete_own" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- SECTION 4: QUIZ QUESTIONS AND RESPONSES
-- =====================================================

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  correct_answer TEXT,
  points INTEGER DEFAULT 10,
  category TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_select_all" ON public.quiz_questions;
CREATE POLICY "quiz_select_all" ON public.quiz_questions FOR SELECT USING (true);

DROP POLICY IF EXISTS "quiz_insert_own" ON public.quiz_questions;
CREATE POLICY "quiz_insert_own" ON public.quiz_questions FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_update_own" ON public.quiz_questions;
CREATE POLICY "quiz_update_own" ON public.quiz_questions FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "quiz_delete_own" ON public.quiz_questions;
CREATE POLICY "quiz_delete_own" ON public.quiz_questions FOR DELETE USING (auth.uid() = user_id);

-- Quiz responses from other users
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  score INTEGER,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, responder_id)
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "responses_select_relevant" ON public.quiz_responses;
CREATE POLICY "responses_select_relevant" ON public.quiz_responses FOR SELECT 
  USING (auth.uid() = responder_id OR auth.uid() IN (SELECT user_id FROM public.quiz_questions WHERE id = question_id));

DROP POLICY IF EXISTS "responses_insert_own" ON public.quiz_responses;
CREATE POLICY "responses_insert_own" ON public.quiz_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);

DROP POLICY IF EXISTS "responses_delete_own" ON public.quiz_responses;
CREATE POLICY "responses_delete_own" ON public.quiz_responses FOR DELETE USING (auth.uid() = responder_id);


-- =====================================================
-- SECTION 5: CONNECTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  receiver_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(requester_id, receiver_id)
);

ALTER TABLE public.connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "connections_select_own" ON public.connections;
CREATE POLICY "connections_select_own" ON public.connections FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "connections_insert_own" ON public.connections;
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);

DROP POLICY IF EXISTS "connections_update_relevant" ON public.connections;
CREATE POLICY "connections_update_relevant" ON public.connections FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "connections_delete_own" ON public.connections;
CREATE POLICY "connections_delete_own" ON public.connections FOR DELETE 
  USING (auth.uid() = requester_id);


-- =====================================================
-- SECTION 6: VENUES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.venues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  location TEXT,
  address TEXT,
  city TEXT,
  image_url TEXT,
  category TEXT,
  price_range TEXT,
  rating DECIMAL(2,1),
  features TEXT,
  is_partner BOOLEAN DEFAULT FALSE,
  promo_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_select_all" ON public.venues;
CREATE POLICY "venues_select_all" ON public.venues FOR SELECT USING (true);


-- =====================================================
-- SECTION 7: DATE INVITES (BOOKINGS) TABLE
-- =====================================================

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

DROP POLICY IF EXISTS "invites_select_own" ON public.date_invites;
CREATE POLICY "invites_select_own" ON public.date_invites FOR SELECT 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);

DROP POLICY IF EXISTS "invites_insert_own" ON public.date_invites;
CREATE POLICY "invites_insert_own" ON public.date_invites FOR INSERT 
  WITH CHECK (auth.uid() = inviter_id);

DROP POLICY IF EXISTS "invites_update_relevant" ON public.date_invites;
CREATE POLICY "invites_update_relevant" ON public.date_invites FOR UPDATE 
  USING (auth.uid() = inviter_id OR auth.uid() = invitee_id);


-- =====================================================
-- SECTION 8: COMMUNITY POSTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT DEFAULT 'general' CHECK (post_type IN ('general', 'event', 'recommendation', 'question')),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  video_url TEXT,
  video_duration INTEGER,
  media_urls TEXT[],
  media_type TEXT DEFAULT 'none',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_all" ON public.community_posts;
CREATE POLICY "posts_select_all" ON public.community_posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "posts_insert_own" ON public.community_posts;
CREATE POLICY "posts_insert_own" ON public.community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_update_own" ON public.community_posts;
CREATE POLICY "posts_update_own" ON public.community_posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "posts_delete_own" ON public.community_posts;
CREATE POLICY "posts_delete_own" ON public.community_posts FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- SECTION 9: NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT,
  related_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  related_entity_id UUID,
  is_read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  action_type TEXT,
  action_label TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "notifications_select_own" ON public.notifications;
CREATE POLICY "notifications_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_insert_any" ON public.notifications;
CREATE POLICY "notifications_insert_any" ON public.notifications FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "notifications_update_own" ON public.notifications;
CREATE POLICY "notifications_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "notifications_delete_own" ON public.notifications;
CREATE POLICY "notifications_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);


-- =====================================================
-- SECTION 10: WALLETS AND TRANSACTIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  balance DECIMAL(10, 2) DEFAULT 0.00,
  held_balance DECIMAL(10, 2) DEFAULT 0.00,
  currency TEXT DEFAULT 'GBP',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallets(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'payment', 'refund', 'hold', 'release')),
  amount DECIMAL(10, 2) NOT NULL,
  description TEXT,
  related_date_id UUID REFERENCES public.date_invites(id),
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "wallets_select_own" ON public.wallets;
CREATE POLICY "wallets_select_own" ON public.wallets FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_insert_own" ON public.wallets;
CREATE POLICY "wallets_insert_own" ON public.wallets FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "wallets_update_own" ON public.wallets;
CREATE POLICY "wallets_update_own" ON public.wallets FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_select_own" ON public.wallet_transactions;
CREATE POLICY "transactions_select_own" ON public.wallet_transactions FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "transactions_insert_own" ON public.wallet_transactions;
CREATE POLICY "transactions_insert_own" ON public.wallet_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- SECTION 11: ANALYTICS EVENTS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  related_user_id UUID REFERENCES public.profiles(id),
  related_entity_id UUID,
  entity_type TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "analytics_select_own" ON public.analytics_events;
CREATE POLICY "analytics_select_own" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "analytics_insert_own" ON public.analytics_events;
CREATE POLICY "analytics_insert_own" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- SECTION 12: DEALS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  terms TEXT,
  promo_code TEXT,
  discount_amount INTEGER,
  valid_from TIMESTAMPTZ,
  valid_until TIMESTAMPTZ,
  cta_text TEXT DEFAULT 'Get Deal',
  cta_url TEXT,
  external_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "deals_select_all" ON public.deals;
CREATE POLICY "deals_select_all" ON public.deals FOR SELECT USING (is_active = true);

DROP POLICY IF EXISTS "deals_insert_admin" ON public.deals;
CREATE POLICY "deals_insert_admin" ON public.deals FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deals_update_admin" ON public.deals;
CREATE POLICY "deals_update_admin" ON public.deals FOR UPDATE USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "deals_delete_admin" ON public.deals;
CREATE POLICY "deals_delete_admin" ON public.deals FOR DELETE USING (auth.uid() IS NOT NULL);


-- =====================================================
-- SECTION 13: RPC FUNCTIONS (HELPER FUNCTIONS)
-- =====================================================

CREATE OR REPLACE FUNCTION increment_post_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = likes_count + 1 
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION decrement_post_likes(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET likes_count = GREATEST(likes_count - 1, 0)
  WHERE id = post_id;
END;
$$;

CREATE OR REPLACE FUNCTION increment_post_comments(post_id UUID)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE community_posts 
  SET comments_count = comments_count + 1 
  WHERE id = post_id;
END;
$$;


-- =====================================================
-- SECTION 14: SEED SAMPLE DATA (OPTIONAL)
-- =====================================================

-- Sample Venues
INSERT INTO venues (name, description, address, city, category, image_url, rating, price_range, features, promo_text, is_partner)
VALUES
  ('The Ivy Chelsea Garden', 'An elegant dining destination with beautiful garden views and contemporary British cuisine', '197 King''s Road, Chelsea', 'London', 'Fine Dining', '/images/restaurant-elegant-dining-ambiance-warm-lighting.jpg', 4.8, '$$$', 'Outdoor Seating;Private Dining;Weekend Brunch;Cocktail Bar', '30% off mains this week', true),
  ('Nightjar', 'Award-winning cocktail bar with live jazz in a 1920s speakeasy setting', '129 City Road, Shoreditch', 'London', 'Cocktail Bar', '/images/cocktail-bar-moody-lighting-craft-drinks-vintage.jpg', 4.7, '$$', 'Live Music;Craft Cocktails;Late Night;Reservations Required', '2-for-1 cocktails on Fridays', true),
  ('Sketch Gallery', 'Instagrammable restaurant with pink velvet interiors and modern European cuisine', '9 Conduit Street, Mayfair', 'London', 'Restaurant & Bar', '/images/restaurant-pink-interior-modern-design-elegant.jpg', 4.6, '$$$', 'Afternoon Tea;Photo Worthy;Champagne Bar;Fine Dining', 'Complimentary dessert with dinner', true),
  ('Four Quarters', 'Arcade bar with vintage games, craft beer, and American street food', '187 Rye Lane, Peckham', 'London', 'Arcade Bar', '/images/arcade-bar-neon-lights-gaming-machines-casual.jpg', 4.5, '$', 'Arcade Games;Craft Beer;Late Night;Groups Welcome', 'Free game tokens with first drink', true),
  ('Aqua Shard', 'Contemporary British restaurant on the 31st floor with panoramic London views', 'Level 31, The Shard', 'London', 'Fine Dining', '/images/restaurant-panoramic-views-modern-interior-upscale.jpg', 4.9, '$$$$', 'Skyline Views;Private Events;Tasting Menu;Wine Pairing', 'Sunday brunch special', true),
  ('BLISS Spa London', 'Luxury wellness retreat offering holistic treatments and relaxation therapies', '60 Sloane Avenue, Chelsea', 'London', 'Spa & Wellness', '/images/luxurious-spa-wellness-center-tranquil-atmosphere-s-vevzs.jpg', 4.8, '$$$', 'Couples Massage;Sauna;Hot Tub;Aromatherapy', 'Book a couples package', true)
ON CONFLICT (name) DO NOTHING;

-- Sample Deals  
INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Weekend Brunch Special',
  'Enjoy 30% off all brunch mains every Saturday and Sunday. Book your table now!',
  'limited_time',
  30,
  'BRUNCH30',
  NOW(),
  NOW() + INTERVAL '30 days',
  'Book Now',
  '/app/spots'
FROM venues v WHERE v.name = 'The Ivy Chelsea Garden'
ON CONFLICT DO NOTHING;

INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Happy Hour Cocktails',
  'Get 2-for-1 on all cocktails every Friday from 6-8pm. No reservation needed.',
  'new_arrival',
  50,
  'HAPPY2FOR1',
  NOW(),
  NOW() + INTERVAL '60 days',
  'View Menu',
  '/app/spots'
FROM venues v WHERE v.name = 'Nightjar'
ON CONFLICT DO NOTHING;

INSERT INTO deals (venue_id, title, description, type, discount_amount, promo_code, valid_from, valid_until, cta_text, cta_url)
SELECT 
  v.id,
  'Couples Spa Package',
  'Luxury spa day for two including massage, sauna access, and champagne. Perfect for date day.',
  'amenity',
  20,
  'COUPLES20',
  NOW(),
  NOW() + INTERVAL '90 days',
  'Book Package',
  '/app/spots'
FROM venues v WHERE v.name = 'BLISS Spa London'
ON CONFLICT DO NOTHING;


-- =====================================================
-- SECTION 15: SUPER ADMIN SETUP (RUN AFTER USER SIGNUP)
-- =====================================================
-- Uncomment and run after these users have signed up:
-- 
-- UPDATE profiles SET user_role = 'super_admin' WHERE email = 'abidoyedimeji@gmail.com';
-- UPDATE profiles SET user_role = 'super_admin' WHERE email = 'hello@emmacomms.co';
-- UPDATE profiles SET user_role = 'super_admin' WHERE email = 'dimeji@emmacomms.co';


-- =====================================================
-- END OF DANA DATABASE SCHEMA
-- =====================================================
