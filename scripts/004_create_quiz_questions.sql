-- Dana App Database Schema
-- Part 4: Quiz Questions and Ice Breakers

CREATE TABLE IF NOT EXISTS public.quiz_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "quiz_select_all" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_insert_own" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_update_own" ON public.quiz_questions;
DROP POLICY IF EXISTS "quiz_delete_own" ON public.quiz_questions;
CREATE POLICY "quiz_select_all" ON public.quiz_questions FOR SELECT USING (true);
CREATE POLICY "quiz_insert_own" ON public.quiz_questions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "quiz_update_own" ON public.quiz_questions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "quiz_delete_own" ON public.quiz_questions FOR DELETE USING (auth.uid() = user_id);

-- Quiz responses from other users
CREATE TABLE IF NOT EXISTS public.quiz_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  responder_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  response TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(question_id, responder_id)
);

ALTER TABLE public.quiz_responses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "responses_select_relevant" ON public.quiz_responses;
DROP POLICY IF EXISTS "responses_insert_own" ON public.quiz_responses;
DROP POLICY IF EXISTS "responses_delete_own" ON public.quiz_responses;
CREATE POLICY "responses_select_relevant" ON public.quiz_responses FOR SELECT 
  USING (auth.uid() = responder_id OR auth.uid() IN (SELECT user_id FROM public.quiz_questions WHERE id = question_id));
CREATE POLICY "responses_insert_own" ON public.quiz_responses FOR INSERT WITH CHECK (auth.uid() = responder_id);
CREATE POLICY "responses_delete_own" ON public.quiz_responses FOR DELETE USING (auth.uid() = responder_id);
