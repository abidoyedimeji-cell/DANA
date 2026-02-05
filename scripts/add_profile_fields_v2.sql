-- Add gender and phone fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS phone text;

-- Add first_name column if it doesn't exist (we'll migrate display_name data)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS first_name text;
