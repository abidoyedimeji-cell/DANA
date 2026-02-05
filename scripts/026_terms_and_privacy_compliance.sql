-- =====================================================
-- DANA Terms & Privacy Compliance
-- Adds terms acceptance tracking and privacy policy versioning
-- =====================================================

BEGIN;

-- 1. Add terms acceptance columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS terms_accepted_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS privacy_policy_version TEXT DEFAULT '1.0';

-- 2. Add index for compliance queries
CREATE INDEX IF NOT EXISTS idx_profiles_terms_accepted 
ON public.profiles(terms_accepted_at) 
WHERE terms_accepted_at IS NOT NULL;

COMMENT ON COLUMN public.profiles.terms_accepted_at IS 'Timestamp when user accepted Terms of Service (GDPR/CCPA compliance)';
COMMENT ON COLUMN public.profiles.privacy_policy_version IS 'Version of privacy policy user accepted (for policy updates)';

COMMIT;
