-- Add user_role column to profiles (e.g. 'user' | 'admin')
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS user_role TEXT DEFAULT 'user';

-- Optional: index for role-based queries
CREATE INDEX IF NOT EXISTS idx_profiles_user_role ON profiles(user_role);

-- Grant admin access to specific emails (matches auth.users.email)
-- Run this in Supabase SQL Editor with sufficient privileges (e.g. service role / dashboard)
UPDATE profiles p
SET user_role = 'admin'
FROM auth.users u
WHERE p.id = u.id
  AND u.email IN (
    'abidoyedimeji@gmail.com',
    'hello@emmacomms.co'
  );
