-- Dana App Database Schema
-- Part 3: User Preferences and Dating Criteria

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  -- Age preferences
  min_age INTEGER DEFAULT 18,
  max_age INTEGER DEFAULT 50,
  -- Location preferences
  max_distance_miles INTEGER DEFAULT 25,
  preferred_locations TEXT[] DEFAULT '{}',
  -- Dating preferences
  open_to_children BOOLEAN DEFAULT TRUE,
  religion TEXT,
  religious_preference TEXT CHECK (religious_preference IN ('must_match', 'open', 'no_preference')),
  -- Lifestyle
  fitness_level TEXT,
  dietary_habits TEXT,
  smoking TEXT,
  drinking TEXT,
  -- Hobbies (stored as array)
  hobbies TEXT[] DEFAULT '{}',
  -- Availability
  available_days TEXT[] DEFAULT '{}',
  available_times TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "preferences_select_own" ON public.user_preferences;
DROP POLICY IF EXISTS "preferences_insert_own" ON public.user_preferences;
DROP POLICY IF EXISTS "preferences_update_own" ON public.user_preferences;
DROP POLICY IF EXISTS "preferences_delete_own" ON public.user_preferences;
CREATE POLICY "preferences_select_own" ON public.user_preferences FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "preferences_insert_own" ON public.user_preferences FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "preferences_update_own" ON public.user_preferences FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "preferences_delete_own" ON public.user_preferences FOR DELETE USING (auth.uid() = user_id);
