-- 021_contextual_identity_framework.sql
-- DANA Contextual Identity Framework Migration

BEGIN;

-- 1. Rename legacy 'bio' to 'bio_social' for clarity
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND column_name='bio') THEN
    ALTER TABLE public.profiles RENAME COLUMN bio TO bio_social;
  END IF;
END $$;

-- 2. Add Dimensional Fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS interests TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS professional_intents TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS seniority_level TEXT CHECK (seniority_level IN ('junior', 'mid', 'senior', 'executive', 'founder')),
ADD COLUMN IF NOT EXISTS years_in_role INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS industry TEXT;

-- 3. Add Photo Category to existing photo table
ALTER TABLE public.profile_photos 
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'lifestyle' 
CHECK (category IN ('lifestyle', 'professional', 'verification'));

-- 4. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_professional_intents ON public.profiles USING GIN(professional_intents);
CREATE INDEX IF NOT EXISTS idx_profiles_seniority ON public.profiles(seniority_level);
CREATE INDEX IF NOT EXISTS idx_profiles_industry ON public.profiles(industry);

COMMIT;
