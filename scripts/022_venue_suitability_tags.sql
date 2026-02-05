-- 022_venue_suitability_tags.sql
-- Add suitability tags to venues for Contextual Identity Framework

BEGIN;

-- Add suitability tags and business amenities to venues
ALTER TABLE public.venues
ADD COLUMN IF NOT EXISTS suitability_tags TEXT[] DEFAULT ARRAY['social'],
ADD COLUMN IF NOT EXISTS business_amenities TEXT[] DEFAULT '{}';

-- Index for filtering by suitability
CREATE INDEX IF NOT EXISTS idx_venues_suitability_tags 
ON public.venues USING GIN(suitability_tags);

-- Index for business amenities
CREATE INDEX IF NOT EXISTS idx_venues_business_amenities 
ON public.venues USING GIN(business_amenities);

-- Update existing venues to have 'both' by default (can be refined later)
UPDATE public.venues
SET suitability_tags = ARRAY['social', 'business']
WHERE suitability_tags = ARRAY['social'];

COMMENT ON COLUMN public.venues.suitability_tags IS 'Array of context tags: social, business, or both. Used for filtering venues by app mode.';
COMMENT ON COLUMN public.venues.business_amenities IS 'Array of business-specific amenities: wifi, quiet_space, meeting_room, etc.';

COMMIT;
