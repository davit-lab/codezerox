-- Fix user_roles RLS policy to allow admins to read all roles
-- This is needed for AdminUsers page to show all users with their roles

-- Drop existing policy
DROP POLICY IF EXISTS "Users can read own role" ON user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON user_roles;

-- Users can read their own role
CREATE POLICY "Users can read own role"
ON user_roles FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Admins can read all roles (for user management)
CREATE POLICY "Admins can read all roles"
ON user_roles FOR SELECT
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);

-- Admins can update/delete roles
CREATE POLICY "Admins can manage roles"
ON user_roles FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_roles ur WHERE ur.user_id = auth.uid() AND ur.role = 'admin')
);
