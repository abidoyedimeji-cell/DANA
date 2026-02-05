-- DANA Tiered Trust System (profiles)

-- Normalize existing rows to unified DANA account
UPDATE public.profiles
SET profile_mode = 'both'
WHERE profile_mode IS NULL OR profile_mode IN ('dating', 'business');

-- Default all new profiles to unified DANA account
ALTER TABLE public.profiles
ALTER COLUMN profile_mode SET DEFAULT 'both';

-- Tier flags and dossier fields
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_method TEXT DEFAULT 'none',
ADD COLUMN IF NOT EXISTS headline TEXT,
ADD COLUMN IF NOT EXISTS bio_professional TEXT,
ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS experience JSONB DEFAULT '[]';

COMMENT ON COLUMN public.profiles.profile_mode IS 'Unified DANA account mode (always both).';
