-- Fix RLS: Allow users to read their own role
-- This is REQUIRED for admin check to work

ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;
DROP POLICY IF EXISTS "user_roles_select_policy" ON user_roles;

-- Policy 1: Users can read THEIR OWN role (required for isAdmin check)
CREATE POLICY "user_roles_select_own"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Policy 2: Admins can do everything
CREATE POLICY "user_roles_admin_all"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM user_roles WHERE user_id = auth.uid() AND role = 'admin')
);
