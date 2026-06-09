import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTc1NDgsImV4cCI6MjA5MDE5MzU0OH0.IB7XhBjJlckK0N0NF2tXeWrbqYjoyWtFk5vxiGGh-L0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkMissingUsers() {
  console.log('=== Checking for missing users ===\n');
  
  // Get all profiles
  const { data: profiles, error: profilesError } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, created_at');
  
  if (profilesError) {
    console.error('Error fetching profiles:', profilesError);
    return;
  }
  
  console.log(`Total profiles in database: ${profiles?.length || 0}`);
  
  // Get auth users count via RPC
  const { data: authCount, error: countError } = await supabase
    .rpc('get_total_auth_users_count');
  
  if (countError) {
    console.log('Could not get auth count via RPC:', countError.message);
  } else {
    console.log(`Total auth users: ${authCount}`);
  }
  
  // List all profiles
  console.log('\n=== All Profiles ===');
  profiles?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.full_name || 'N/A'} (${p.email}) - ID: ${p.user_id}`);
  });
  
  console.log('\n=== Missing User Detection ===');
  console.log('Profiles found:', profiles?.length || 0);
  
  // Check if there are users without profiles by trying to sync
  const { data: syncResult, error: syncError } = await supabase
    .rpc('sync_auth_users_to_profiles');
  
  if (syncError) {
    console.log('Sync error:', syncError.message);
  } else {
    console.log('Sync executed successfully');
  }
  
  // Check profiles again after sync
  const { data: profilesAfter, error: afterError } = await supabase
    .from('profiles')
    .select('user_id, email, full_name, created_at')
    .order('created_at', { ascending: false })
    .limit(10);
  
  if (!afterError && profilesAfter) {
    console.log('\n=== Latest Profiles (after sync) ===');
    profilesAfter.forEach((p, i) => {
      console.log(`${i + 1}. ${p.full_name || 'N/A'} (${p.email}) - ${new Date(p.created_at).toLocaleDateString()}`);
    });
  }
}

checkMissingUsers();
