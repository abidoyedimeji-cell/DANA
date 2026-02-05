-- Dana App Database Schema
-- Part 2: Profile Photos Table

CREATE TABLE IF NOT EXISTS public.profile_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  photo_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "photos_select_all" ON public.profile_photos FOR SELECT USING (true);
CREATE POLICY "photos_insert_own" ON public.profile_photos FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "photos_update_own" ON public.profile_photos FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "photos_delete_own" ON public.profile_photos FOR DELETE USING (auth.uid() = user_id);
