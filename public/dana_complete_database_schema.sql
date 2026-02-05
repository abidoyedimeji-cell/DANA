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
-- SECTION 0: EXTENSIONS
-- =====================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;


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

-- Ensure columns exist if table was created by an older script (e.g. profiles without email)
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS first_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gender TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS subscription_tier TEXT DEFAULT 'free';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS postcode TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS occupation TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS profile_image_url TEXT;

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (private: only own profile; add public_profiles view later for discovery)
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);

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


-- =====================================================
-- SECTION 1A: PROFESSIONAL LAYER (LINKEDIN-STYLE)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.professional_experience (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  location TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_current BOOLEAN DEFAULT FALSE,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.professional_experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "professional_experience_select_own" ON public.professional_experience;
CREATE POLICY "professional_experience_select_own"
ON public.professional_experience FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "professional_experience_insert_own" ON public.professional_experience;
CREATE POLICY "professional_experience_insert_own"
ON public.professional_experience FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "professional_experience_update_own" ON public.professional_experience;
CREATE POLICY "professional_experience_update_own"
ON public.professional_experience FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "professional_experience_delete_own" ON public.professional_experience;
CREATE POLICY "professional_experience_delete_own"
ON public.professional_experience FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  endorsements_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, skill_name)
);

ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "skills_select_own" ON public.skills;
CREATE POLICY "skills_select_own"
ON public.skills FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "skills_insert_own" ON public.skills;
CREATE POLICY "skills_insert_own"
ON public.skills FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "skills_update_own" ON public.skills;
CREATE POLICY "skills_update_own"
ON public.skills FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "skills_delete_own" ON public.skills;
CREATE POLICY "skills_delete_own"
ON public.skills FOR DELETE
USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.education (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  institution TEXT NOT NULL,
  degree TEXT,
  field_of_study TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "education_select_own" ON public.education;
CREATE POLICY "education_select_own"
ON public.education FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "education_insert_own" ON public.education;
CREATE POLICY "education_insert_own"
ON public.education FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "education_update_own" ON public.education;
CREATE POLICY "education_update_own"
ON public.education FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "education_delete_own" ON public.education;
CREATE POLICY "education_delete_own"
ON public.education FOR DELETE
USING (auth.uid() = user_id);

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
  venue_purpose TEXT DEFAULT 'social' CHECK (venue_purpose IN ('social', 'business', 'both')),
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venues_select_all" ON public.venues;
CREATE POLICY "venues_select_all" ON public.venues FOR SELECT USING (true);

-- Optional: special/limited-access window only. Do NOT use as core venue availability.
-- Core open/close = venue_hours; duration/lead time = venue_booking_rules; intersection
-- should filter by venue_hours open then create hold/event.
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS exclusive_window TSTZRANGE;

ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS venue_purpose TEXT DEFAULT 'social' CHECK (venue_purpose IN ('social', 'business', 'both'));
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.venues ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;
CREATE INDEX IF NOT EXISTS idx_venues_lat_lon ON public.venues(latitude, longitude);

CREATE OR REPLACE FUNCTION public.get_nearby_venues(
  user_lat DOUBLE PRECISION,
  user_lon DOUBLE PRECISION,
  radius_miles INTEGER
)
RETURNS SETOF public.venues
LANGUAGE sql
AS $$
  SELECT v.*
  FROM public.venues v
  WHERE v.latitude IS NOT NULL
    AND v.longitude IS NOT NULL
    AND (
      (6371 * acos(
        LEAST(1, GREATEST(-1,
          cos(radians(user_lat)) * cos(radians(v.latitude)) * cos(radians(v.longitude) - radians(user_lon)) +
          sin(radians(user_lat)) * sin(radians(v.latitude))
        ))
      )) / 1.609
    ) <= radius_miles;
$$;


-- =====================================================
-- SECTION 6A: VENUE HOURS + BOOKING RULES + RESERVATIONS
-- =====================================================

-- Venue hours by day of week (0 = Sunday)
CREATE TABLE IF NOT EXISTS public.venue_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  day_of_week SMALLINT NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  opens_at TIME NOT NULL,
  closes_at TIME NOT NULL,
  is_closed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(venue_id, day_of_week)
);

ALTER TABLE public.venue_hours ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_hours_select_all" ON public.venue_hours;
CREATE POLICY "venue_hours_select_all" ON public.venue_hours FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_venue_hours_venue_day
ON public.venue_hours(venue_id, day_of_week);

-- Venue booking rules (capacity, turn time, timezone)
CREATE TABLE IF NOT EXISTS public.venue_booking_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE UNIQUE,
  timezone TEXT NOT NULL DEFAULT 'UTC',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  turn_minutes INTEGER NOT NULL DEFAULT 90 CHECK (turn_minutes >= 30),
  last_seating_time TIME NOT NULL DEFAULT '21:00',
  enabled_booking_types TEXT[] NOT NULL DEFAULT ARRAY['timed_table'],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.venue_booking_rules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "venue_booking_rules_select_all" ON public.venue_booking_rules;
CREATE POLICY "venue_booking_rules_select_all" ON public.venue_booking_rules FOR SELECT USING (true);

-- Reservation holds (optional)
CREATE TABLE IF NOT EXISTS public.reservation_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('timed_table', 'timed_room')),
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  time_slot TSTZRANGE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reservation_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservation_holds_select_all" ON public.reservation_holds;
CREATE POLICY "reservation_holds_select_all" ON public.reservation_holds FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_venue
ON public.reservation_holds(venue_id);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_time_slot
ON public.reservation_holds USING gist (time_slot);

CREATE INDEX IF NOT EXISTS idx_reservation_holds_expires
ON public.reservation_holds(expires_at);

-- Reservations (confirmed bookings)
CREATE TABLE IF NOT EXISTS public.reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  reservation_type TEXT NOT NULL CHECK (reservation_type IN ('walk_in', 'timed_table', 'timed_room')),
  party_size INTEGER NOT NULL CHECK (party_size > 0),
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  time_slot TSTZRANGE NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "reservations_select_all" ON public.reservations;
CREATE POLICY "reservations_select_all" ON public.reservations FOR SELECT USING (true);

CREATE INDEX IF NOT EXISTS idx_reservations_venue
ON public.reservations(venue_id);

CREATE INDEX IF NOT EXISTS idx_reservations_time_slot
ON public.reservations USING gist (time_slot);

-- Availability RPC: returns true/false based on hours, rules, and capacity
CREATE OR REPLACE FUNCTION public.check_availability(
  venue_id UUID,
  start_at TIMESTAMPTZ,
  party_size INTEGER
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
DECLARE
  rules public.venue_booking_rules%ROWTYPE;
  venue_day SMALLINT;
  local_start TIMESTAMP;
  local_end TIMESTAMP;
  hours public.venue_hours%ROWTYPE;
  active_count INTEGER;
BEGIN
  SELECT * INTO rules
  FROM public.venue_booking_rules
  WHERE venue_booking_rules.venue_id = check_availability.venue_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking rules not found for venue';
  END IF;

  local_start := (start_at AT TIME ZONE rules.timezone);
  local_end := local_start + make_interval(mins => rules.turn_minutes);
  venue_day := EXTRACT(DOW FROM local_start);

  SELECT * INTO hours
  FROM public.venue_hours
  WHERE venue_hours.venue_id = check_availability.venue_id
    AND venue_hours.day_of_week = venue_day;

  IF NOT FOUND OR hours.is_closed THEN
    RETURN FALSE;
  END IF;

  IF local_start::time < hours.opens_at
     OR local_end::time > hours.closes_at
     OR local_start::time > rules.last_seating_time THEN
    RETURN FALSE;
  END IF;

  SELECT
    COALESCE(SUM(r.party_size), 0)
  INTO active_count
  FROM public.reservations r
  WHERE r.venue_id = check_availability.venue_id
    AND r.status = 'confirmed'
    AND r.time_slot && tstzrange(start_at, start_at + make_interval(mins => rules.turn_minutes), '[)');

  SELECT
    active_count + COALESCE(SUM(h.party_size), 0)
  INTO active_count
  FROM public.reservation_holds h
  WHERE h.venue_id = check_availability.venue_id
    AND h.expires_at > NOW()
    AND h.time_slot && tstzrange(start_at, start_at + make_interval(mins => rules.turn_minutes), '[)');

  RETURN (active_count + party_size) <= rules.capacity;
END;
$$;


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
-- SECTION 7A: DANA AVAILABILITY + HOLDS + EVENTS
-- =====================================================

-- User availability blocks
CREATE TABLE IF NOT EXISTS public.dana_availability (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  slot_type TEXT DEFAULT 'one-off' CHECK (slot_type IN ('one-off', 'recurring')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (user_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_availability ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_availability_select_own" ON public.dana_availability;
CREATE POLICY "dana_availability_select_own" ON public.dana_availability
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_insert_own" ON public.dana_availability;
CREATE POLICY "dana_availability_insert_own" ON public.dana_availability
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_update_own" ON public.dana_availability;
CREATE POLICY "dana_availability_update_own" ON public.dana_availability
  FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "dana_availability_delete_own" ON public.dana_availability;
CREATE POLICY "dana_availability_delete_own" ON public.dana_availability
  FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_dana_availability_time_slot
  ON public.dana_availability USING gist (time_slot);

-- Holds (venue-level)
CREATE TABLE IF NOT EXISTS public.dana_table_holds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (venue_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_table_holds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_table_holds_select_participants" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_select_participants" ON public.dana_table_holds
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "dana_table_holds_insert_participants" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_insert_host_only" ON public.dana_table_holds
  FOR INSERT WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "dana_table_holds_delete_participants" ON public.dana_table_holds;
CREATE POLICY "dana_table_holds_delete_host_only" ON public.dana_table_holds
  FOR DELETE USING (auth.uid() = host_id);

CREATE INDEX IF NOT EXISTS idx_dana_table_holds_expires
  ON public.dana_table_holds (expires_at);

-- Confirmed events (venue-level)
CREATE TABLE IF NOT EXISTS public.dana_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID NOT NULL REFERENCES public.venues(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  guest_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  time_slot TSTZRANGE NOT NULL,
  date_invite_id UUID REFERENCES public.date_invites(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  EXCLUDE USING gist (venue_id WITH =, time_slot WITH &&)
);

ALTER TABLE public.dana_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dana_events_select_participants" ON public.dana_events;
CREATE POLICY "dana_events_select_participants" ON public.dana_events
  FOR SELECT USING (auth.uid() = host_id OR auth.uid() = guest_id);

DROP POLICY IF EXISTS "dana_events_insert_participants" ON public.dana_events;
CREATE POLICY "dana_events_insert_participants" ON public.dana_events
  FOR INSERT WITH CHECK (auth.uid() = host_id OR auth.uid() = guest_id);

-- Intersection RPC. Uses exclusive_window only when set (special/limited access).
-- For normal OpenTable-style flow: use user overlap (A ∩ B), snap to slots from
-- venue_booking_rules, filter by venue_hours open, then create hold/event.
CREATE OR REPLACE FUNCTION public.get_dana_intersection(
  host_id UUID,
  guest_id UUID,
  target_venue_id UUID,
  meeting_duration INTERVAL DEFAULT '90 minutes'
)
RETURNS TABLE (meeting_window TSTZRANGE)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT (a.time_slot * b.time_slot * v.exclusive_window) AS meeting_window
  FROM public.dana_availability a
  JOIN public.dana_availability b ON a.time_slot && b.time_slot
  JOIN public.venues v ON v.id = target_venue_id
  WHERE a.user_id = host_id
    AND b.user_id = guest_id
    AND v.exclusive_window IS NOT NULL
    AND (a.time_slot * b.time_slot * v.exclusive_window) IS NOT NULL
    AND upper(a.time_slot * b.time_slot * v.exclusive_window)
        - lower(a.time_slot * b.time_slot * v.exclusive_window) >= meeting_duration;
END;
$$;

-- Hold + confirm RPCs
CREATE OR REPLACE FUNCTION public.create_dana_hold(
  host_id UUID,
  guest_id UUID,
  venue_id UUID,
  time_slot TSTZRANGE,
  meeting_duration INTERVAL DEFAULT '90 minutes',
  hold_ttl INTERVAL DEFAULT '5 minutes'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  hold_id UUID;
BEGIN
  IF upper(time_slot) - lower(time_slot) < meeting_duration THEN
    RAISE EXCEPTION 'Requested time slot is shorter than meeting duration';
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM public.get_dana_intersection(host_id, guest_id, venue_id, meeting_duration) AS mw
    WHERE time_slot <@ mw.meeting_window
  ) THEN
    RAISE EXCEPTION 'Requested time slot is not in an available intersection window';
  END IF;

  IF EXISTS (
    SELECT 1 FROM public.dana_events e
    WHERE e.venue_id = venue_id AND e.time_slot && time_slot
  ) THEN
    RAISE EXCEPTION 'Requested time slot overlaps an existing event';
  END IF;

  INSERT INTO public.dana_table_holds (venue_id, host_id, guest_id, time_slot, expires_at)
  VALUES (venue_id, host_id, guest_id, time_slot, NOW() + hold_ttl)
  RETURNING id INTO hold_id;

  RETURN hold_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.confirm_dana_booking(
  hold_id UUID,
  p_date_invite_id UUID
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  hold_row public.dana_table_holds%ROWTYPE;
  invite_row public.date_invites%ROWTYPE;
  event_id UUID;
BEGIN
  IF p_date_invite_id IS NULL THEN
    RAISE EXCEPTION 'date_invite_id is required';
  END IF;

  -- Lock the hold row so two confirms can't race
  SELECT * INTO hold_row
  FROM public.dana_table_holds
  WHERE id = hold_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Hold not found';
  END IF;

  IF hold_row.expires_at <= NOW() THEN
    RAISE EXCEPTION 'Hold has expired';
  END IF;

  -- Load the invite
  SELECT * INTO invite_row
  FROM public.date_invites
  WHERE id = p_date_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  -- Invite must match hold participants (either direction)
  IF NOT (
    (invite_row.inviter_id = hold_row.host_id AND invite_row.invitee_id = hold_row.guest_id)
    OR
    (invite_row.inviter_id = hold_row.guest_id AND invite_row.invitee_id = hold_row.host_id)
  ) THEN
    RAISE EXCEPTION 'Invite does not match hold participants';
  END IF;

  -- BOTH must have paid before confirmation
  IF COALESCE(invite_row.inviter_paid, FALSE) <> TRUE
     OR COALESCE(invite_row.invitee_paid, FALSE) <> TRUE THEN
    RAISE EXCEPTION 'Both parties must pay before confirmation';
  END IF;

  -- Only INVITER can confirm
  IF auth.uid() IS NULL OR auth.uid() <> invite_row.inviter_id THEN
    RAISE EXCEPTION 'Only the inviter can confirm';
  END IF;

  -- Create the event linked to the invite
  INSERT INTO public.dana_events (venue_id, host_id, guest_id, time_slot, date_invite_id)
  VALUES (hold_row.venue_id, hold_row.host_id, hold_row.guest_id, hold_row.time_slot, p_date_invite_id)
  RETURNING id INTO event_id;

  -- Mark invite accepted
  UPDATE public.date_invites
  SET status = 'accepted', updated_at = NOW()
  WHERE id = p_date_invite_id;

  -- Remove hold
  DELETE FROM public.dana_table_holds WHERE id = hold_id;

  RETURN event_id;
END;
$$;

-- Payment flags (call after Stripe/checkout succeeds; no real money here)
CREATE OR REPLACE FUNCTION public.mark_inviter_paid(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> inv.inviter_id THEN
    RAISE EXCEPTION 'Only the inviter can mark inviter_paid';
  END IF;

  IF inv.status IN ('declined', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Cannot pay for an invite in status %', inv.status;
  END IF;

  IF COALESCE(inv.invitee_paid, FALSE) = TRUE AND COALESCE(inv.inviter_paid, FALSE) = FALSE THEN
    RAISE EXCEPTION 'Invitee already paid; inviter should have paid first (data inconsistent)';
  END IF;

  UPDATE public.date_invites
  SET inviter_paid = TRUE, updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_invitee_paid(p_invite_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inv public.date_invites%ROWTYPE;
BEGIN
  SELECT * INTO inv
  FROM public.date_invites
  WHERE id = p_invite_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Invite not found';
  END IF;

  IF auth.uid() IS NULL OR auth.uid() <> inv.invitee_id THEN
    RAISE EXCEPTION 'Only the invitee can mark invitee_paid';
  END IF;

  IF inv.status IN ('declined', 'cancelled', 'completed') THEN
    RAISE EXCEPTION 'Cannot pay for an invite in status %', inv.status;
  END IF;

  IF COALESCE(inv.inviter_paid, FALSE) <> TRUE THEN
    RAISE EXCEPTION 'Inviter must pay first';
  END IF;

  UPDATE public.date_invites
  SET invitee_paid = TRUE, updated_at = NOW()
  WHERE id = p_invite_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.mark_inviter_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.mark_invitee_paid(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION public.confirm_dana_booking(UUID, UUID) TO authenticated;


-- =====================================================
-- SECTION 7B: BOOKING DEPOSITS (trigger on confirm)
-- =====================================================

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

ALTER TABLE public.booking_deposits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "booking_deposits_select_own" ON public.booking_deposits;
CREATE POLICY "booking_deposits_select_own"
  ON public.booking_deposits FOR SELECT
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_booking_deposits_date_invite ON public.booking_deposits(date_invite_id);
CREATE INDEX IF NOT EXISTS idx_booking_deposits_status_created ON public.booking_deposits(status, created_at);

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

-- Release job: run periodically (pg_cron or Edge Function). Then trigger Stripe payout.
CREATE OR REPLACE FUNCTION public.release_eligible_booking_deposits()
RETURNS TABLE (id UUID, date_invite_id UUID, user_id UUID, amount DECIMAL)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH updated AS (
    UPDATE public.booking_deposits
    SET status = 'released_to_stripe', released_at = NOW()
    WHERE booking_deposits.status = 'held'
      AND booking_deposits.created_at + interval '7 days' < NOW()
    RETURNING booking_deposits.id, booking_deposits.date_invite_id, booking_deposits.user_id, booking_deposits.amount
  )
  SELECT updated.id, updated.date_invite_id, updated.user_id, updated.amount FROM updated;
END;
$$;


-- =====================================================
-- SECTION 7C: MEET FORM COMPLETIONS + WINDOW
-- =====================================================

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

  SELECT * INTO ev
  FROM public.dana_events
  WHERE date_invite_id = p_date_invite_id
  LIMIT 1;

  IF FOUND AND ev.time_slot IS NOT NULL THEN
    slot_start := lower(ev.time_slot);
    slot_end := upper(ev.time_slot);
  ELSE
    slot_start := (inv.proposed_date + inv.proposed_time) AT TIME ZONE 'UTC';
    slot_end := slot_start + interval '90 minutes';
  END IF;

  window_start := slot_start - interval '15 minutes';
  window_end := slot_end + interval '60 minutes';

  RETURN (NOW() >= window_start AND NOW() <= window_end);
END;
$$;

GRANT EXECUTE ON FUNCTION public.meet_form_window_open(UUID) TO authenticated;


-- =====================================================
-- SECTION 7D: VENUE CREDIT CODES
-- =====================================================

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


-- =====================================================
-- SECTION 7E: BOOKING SWAPS (reschedule / change venue)
-- =====================================================

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

  SELECT * INTO inv FROM public.date_invites WHERE id = p_date_invite_id;
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Invite not found'::TEXT;
    RETURN;
  END IF;

  IF auth.uid() <> inv.inviter_id AND auth.uid() <> inv.invitee_id THEN
    RETURN QUERY SELECT FALSE, 'Not a participant'::TEXT;
    RETURN;
  END IF;

  SELECT * INTO ev FROM public.dana_events WHERE date_invite_id = p_date_invite_id LIMIT 1;
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
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  SELECT * INTO inv FROM public.date_invites WHERE id = p_date_invite_id;
  IF NOT FOUND THEN RAISE EXCEPTION 'Invite not found'; END IF;
  IF auth.uid() <> inv.inviter_id THEN RAISE EXCEPTION 'Only the inviter can execute the swap'; END IF;

  SELECT * INTO ev FROM public.dana_events WHERE date_invite_id = p_date_invite_id LIMIT 1;
  IF NOT FOUND THEN RAISE EXCEPTION 'Booking not confirmed'; END IF;
  IF EXTRACT(EPOCH FROM (lower(ev.time_slot) - NOW())) / 3600 < 24 THEN
    RAISE EXCEPTION 'Swap not allowed within 24 hours of the event';
  END IF;

  INSERT INTO public.booking_swaps (
    date_invite_id, previous_venue_id, previous_time_slot,
    new_venue_id, new_time_slot, new_proposed_date, new_proposed_time, fee_charged
  )
  VALUES (
    p_date_invite_id, ev.venue_id, ev.time_slot,
    p_new_venue_id, p_new_time_slot,
    COALESCE(p_new_proposed_date, (lower(p_new_time_slot))::date),
    COALESCE(p_new_proposed_time, (lower(p_new_time_slot))::time),
    1.99
  )
  RETURNING id INTO swap_id;

  UPDATE public.date_invites
  SET venue_id = p_new_venue_id,
      proposed_date = COALESCE(p_new_proposed_date, (lower(p_new_time_slot))::date),
      proposed_time = COALESCE(p_new_proposed_time, (lower(p_new_time_slot))::time),
      updated_at = NOW()
  WHERE id = p_date_invite_id;

  UPDATE public.dana_events
  SET venue_id = p_new_venue_id, time_slot = p_new_time_slot, created_at = NOW()
  WHERE date_invite_id = p_date_invite_id;

  RETURN swap_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.can_swap_booking(UUID, UUID, TSTZRANGE) TO authenticated;
GRANT EXECUTE ON FUNCTION public.execute_booking_swap(UUID, UUID, TSTZRANGE, DATE, TIME) TO authenticated;


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

ALTER TABLE public.community_posts ADD COLUMN IF NOT EXISTS visibility_mode TEXT DEFAULT 'social'
  CHECK (visibility_mode IN ('social', 'business', 'both'));

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

-- Auto-create wallet when a profile is created
CREATE OR REPLACE FUNCTION public.handle_new_wallet()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.wallets (user_id, balance, held_balance, currency)
  VALUES (NEW.id, 0.00, 0.00, 'GBP')
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_profile_created_create_wallet ON public.profiles;
CREATE TRIGGER on_profile_created_create_wallet
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_wallet();


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
INSERT INTO venues (name, description, address, city, category, image_url, rating, price_range, features, promo_text, is_partner, venue_purpose)
VALUES
  ('The Ivy Chelsea Garden', 'An elegant dining destination with beautiful garden views and contemporary British cuisine', '197 King''s Road, Chelsea', 'London', 'Fine Dining', '/images/restaurant-elegant-dining-ambiance-warm-lighting.jpg', 4.8, '$$$', 'Outdoor Seating;Private Dining;Weekend Brunch;Cocktail Bar', '30% off mains this week', true, 'both'),
  ('Nightjar', 'Award-winning cocktail bar with live jazz in a 1920s speakeasy setting', '129 City Road, Shoreditch', 'London', 'Cocktail Bar', '/images/cocktail-bar-moody-lighting-craft-drinks-vintage.jpg', 4.7, '$$', 'Live Music;Craft Cocktails;Late Night;Reservations Required', '2-for-1 cocktails on Fridays', true, 'social'),
  ('Sketch Gallery', 'Instagrammable restaurant with pink velvet interiors and modern European cuisine', '9 Conduit Street, Mayfair', 'London', 'Restaurant & Bar', '/images/restaurant-pink-interior-modern-design-elegant.jpg', 4.6, '$$$', 'Afternoon Tea;Photo Worthy;Champagne Bar;Fine Dining', 'Complimentary dessert with dinner', true, 'both'),
  ('Four Quarters', 'Arcade bar with vintage games, craft beer, and American street food', '187 Rye Lane, Peckham', 'London', 'Arcade Bar', '/images/arcade-bar-neon-lights-gaming-machines-casual.jpg', 4.5, '$', 'Arcade Games;Craft Beer;Late Night;Groups Welcome', 'Free game tokens with first drink', true, 'social'),
  ('Aqua Shard', 'Contemporary British restaurant on the 31st floor with panoramic London views', 'Level 31, The Shard', 'London', 'Fine Dining', '/images/restaurant-panoramic-views-modern-interior-upscale.jpg', 4.9, '$$$$', 'Skyline Views;Private Events;Tasting Menu;Wine Pairing', 'Sunday brunch special', true, 'business'),
  ('BLISS Spa London', 'Luxury wellness retreat offering holistic treatments and relaxation therapies', '60 Sloane Avenue, Chelsea', 'London', 'Spa & Wellness', '/images/luxurious-spa-wellness-center-tranquil-atmosphere-s-vevzs.jpg', 4.8, '$$$', 'Couples Massage;Sauna;Hot Tub;Aromatherapy', 'Book a couples package', true, 'social')
ON CONFLICT (name) DO NOTHING;

-- Sample Deals (run after venues seed; omit if you prefer no seed deals)
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
FROM venues v
WHERE v.name = 'The Ivy Chelsea Garden'
  AND NOT EXISTS (SELECT 1 FROM deals d WHERE d.venue_id = v.id AND d.title = 'Weekend Brunch Special');

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
FROM venues v
WHERE v.name = 'Nightjar'
  AND NOT EXISTS (SELECT 1 FROM deals d WHERE d.venue_id = v.id AND d.title = 'Happy Hour Cocktails');

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
FROM venues v
WHERE v.name = 'BLISS Spa London'
  AND NOT EXISTS (SELECT 1 FROM deals d WHERE d.venue_id = v.id AND d.title = 'Couples Spa Package');


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
