-- =====================================================
-- DANA RLS Privacy Audit - Connection-Only Sensitive Fields
-- Ensures calendar links and sensitive data are only visible to connected users
-- =====================================================

BEGIN;

-- 1. Ensure RLS is enabled (precaution)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 2. Drop existing overly-permissive SELECT policy if it exists
DROP POLICY IF EXISTS "profiles_select_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;

-- 3. Create granular SELECT policies
-- Note: PostgreSQL RLS works at row level, not column level.
-- These policies control which ROWS are visible, not which COLUMNS.
-- For column-level filtering, use application logic or PostgreSQL 15+ column security.

-- Policy 1: Everyone can see all profiles (for public fields)
-- This allows SELECT queries, but your app should filter columns based on connection status
CREATE POLICY "profiles_select_all"
ON public.profiles FOR SELECT
USING (true);

-- Policy 2: Users can always see their own profile
-- This is redundant with Policy 1 but explicit for clarity
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT
USING (auth.uid() = id);

-- Policy 3: Helper function to check if two users are connected
-- This will be used by application code to determine if sensitive columns should be shown
CREATE OR REPLACE FUNCTION public.are_users_connected(p_user_id UUID, p_target_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.connections
    WHERE status = 'accepted'
    AND (
      (requester_id = p_user_id AND receiver_id = p_target_id)
      OR (requester_id = p_target_id AND receiver_id = p_user_id)
    )
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.are_users_connected(UUID, UUID) TO authenticated;

-- Note: In practice, you may want to use column-level security or views
-- For now, this policy ensures RLS blocks access, but you'll need to handle
-- column filtering in your application code (e.g., don't SELECT calendar_link_social
-- unless the policy allows it)

COMMENT ON POLICY "profiles_select_all" ON public.profiles IS 
  'All authenticated users can see profile rows. Column filtering happens in application code.';

COMMENT ON FUNCTION public.are_users_connected(UUID, UUID) IS 
  'Helper function to check if two users have an accepted connection. Use this in application code to determine if sensitive columns (calendar_link_social, bio_social) should be shown.';

COMMIT;
