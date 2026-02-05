-- Dana App Database Schema
-- Part 5: Connections and Invites

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

CREATE POLICY "connections_select_own" ON public.connections FOR SELECT 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "connections_insert_own" ON public.connections FOR INSERT 
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "connections_update_relevant" ON public.connections FOR UPDATE 
  USING (auth.uid() = requester_id OR auth.uid() = receiver_id);
CREATE POLICY "connections_delete_own" ON public.connections FOR DELETE 
  USING (auth.uid() = requester_id);
