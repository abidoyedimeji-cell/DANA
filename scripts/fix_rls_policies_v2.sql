-- Fix RLS policies for profile creation during signup
-- Drop conflicting INSERT policies
DROP POLICY IF EXISTS "profiles_insert_own" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;

-- Create a single, permissive INSERT policy that allows:
-- 1. Authenticated users to insert their own profile
-- 2. Service role to insert profiles (for triggers)
CREATE POLICY "profiles_insert_authenticated" 
ON profiles FOR INSERT 
WITH CHECK (
  auth.uid() = id OR 
  auth.jwt() ->> 'role' = 'service_role'
);

-- Ensure UPDATE policy exists
DROP POLICY IF EXISTS "profiles_update_own" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

CREATE POLICY "profiles_update_own" 
ON profiles FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Ensure DELETE policy exists
DROP POLICY IF EXISTS "profiles_delete_own" ON profiles;

CREATE POLICY "profiles_delete_own" 
ON profiles FOR DELETE 
USING (auth.uid() = id);

-- Keep SELECT policy allowing all to view profiles
DROP POLICY IF EXISTS "profiles_select_all" ON profiles;

CREATE POLICY "profiles_select_all" 
ON profiles FOR SELECT 
USING (true);
