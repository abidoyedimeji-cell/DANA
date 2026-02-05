-- Profile verifications (id_scan, selfie)
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('id_scan','selfie')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "verifications_select_own" ON public.verifications;
CREATE POLICY "verifications_select_own" ON public.verifications FOR SELECT
  USING (auth.uid() = profile_id);

DROP POLICY IF EXISTS "verifications_insert_own" ON public.verifications;
CREATE POLICY "verifications_insert_own" ON public.verifications FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE INDEX IF NOT EXISTS idx_verifications_profile ON public.verifications(profile_id);
