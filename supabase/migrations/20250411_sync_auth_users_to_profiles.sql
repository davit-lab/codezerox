-- Create a function to sync auth users with profiles
-- This ensures all auth users have corresponding profiles

-- Create or replace function to get total auth users count
CREATE OR REPLACE FUNCTION get_total_auth_users_count()
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM auth.users;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Create or replace function to sync missing profiles
CREATE OR REPLACE FUNCTION sync_auth_users_to_profiles()
RETURNS VOID AS $$
DECLARE
  user_record RECORD;
BEGIN
  -- For each auth user without a profile, create one
  FOR user_record IN 
    SELECT id, email, raw_user_meta_data->>'full_name' as full_name, raw_user_meta_data->>'avatar_url' as avatar_url, created_at
    FROM auth.users
    WHERE id NOT IN (SELECT user_id FROM profiles)
  LOOP
    INSERT INTO profiles (user_id, email, full_name, avatar_url, created_at)
    VALUES (
      user_record.id,
      user_record.email,
      user_record.full_name,
      user_record.avatar_url,
      user_record.created_at
    );
    
    -- Also create default user role
    INSERT INTO user_roles (user_id, role)
    VALUES (user_record.id, 'user')
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Execute the sync function
SELECT sync_auth_users_to_profiles();

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION get_total_auth_users_count() TO authenticated;
GRANT EXECUTE ON FUNCTION sync_auth_users_to_profiles() TO authenticated;
