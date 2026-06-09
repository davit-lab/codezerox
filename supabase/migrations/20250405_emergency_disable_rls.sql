-- Emergency fix: Disable RLS to restore admin access
-- Run this immediately in Supabase SQL Editor

-- Disable RLS on user_roles (restore access)
ALTER TABLE user_roles DISABLE ROW LEVEL SECURITY;

-- Disable RLS on profiles (restore access)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Confirm
SELECT 'RLS disabled on user_roles and profiles' as status;
