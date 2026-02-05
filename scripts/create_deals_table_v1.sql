-- Create deals table for managing venue promotions
CREATE TABLE IF NOT EXISTS deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  type TEXT NOT NULL, -- e.g. "discount", "complimentary", "credit"
  description TEXT,
  terms TEXT,
  promo_code TEXT,
  cta_text TEXT DEFAULT 'Get Deal',
  external_link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active deals
CREATE POLICY deals_select_all ON deals
  FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated users can insert deals (admin)
CREATE POLICY deals_insert_admin ON deals
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can update deals (admin)
CREATE POLICY deals_update_admin ON deals
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Policy: Only authenticated users can delete deals (admin)
CREATE POLICY deals_delete_admin ON deals
  FOR DELETE
  USING (auth.uid() IS NOT NULL);
