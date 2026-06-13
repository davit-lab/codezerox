// Import users from CSV with hashed passwords
// CSV format: user_id, email, full_name, role, password_hash, created_at

import { createClient } from '@supabase/supabase-js';

// Supabase credentials
const supabaseUrl = 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDYxNzU0OCwiZXhwIjoyMDkwMTkzNTQ4fQ.IB7XhBjJlckK0N0NF2tXeWrbqYjoyWtFk5vxiGGh-L0';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// CSV data
const csvUsers = [
  {
    user_id: '0b1db34b-506e-4a4e-9c0b-9417920c70e1',
    email: 'tsivtsivadze23@gmail.com',
    full_name: 'დავით წივწივაძე',
    role: 'user',
    password_hash: '$2a$10$rOKCbcukx0fBdWr3COj9QOdOIwfnY8fqaCvIs.troy1wuHhxzhu1.',
    created_at: '2026-04-01 15:19:11'
  },
  {
    user_id: '9ae70fa0-cc23-4d54-881f-af328844f10b',
    email: 'shengeliagiorgi2023@gmail.com',
    full_name: 'გიორგი შენგელია',
    role: 'user',
    password_hash: '$2a$10$ca9OaOXRYYoFA1o0T0uCXuvSUPVXjehR9KJx.cIkiD1qYPquguuKy',
    created_at: '2026-04-11 11:49:17'
  },
  {
    user_id: '6fc312a3-10ae-4da2-b4d3-c8bac2314993',
    email: 'ecseminari@gmail.com',
    full_name: 'ირაკლი მარგველაშვილი',
    role: 'user',
    password_hash: '$2a$10$WhhRks0vwDiLtiUJgtyu9uCq7mF3DlzgFeDkyO9IdZ9pqHh4aV4zy',
    created_at: '2026-04-11 16:35:40'
  },
  {
    user_id: '9be5a950-2718-4cff-bd1b-fc6e401c8202',
    email: 'maria.kh.2073@gmail.com',
    full_name: 'მარიამი ხმალაძე',
    role: 'user',
    password_hash: '$2a$10$GlmBO97a9KhwJ.2sT7LZHOOmkMRGidqxAYXXHeLsLBbOHHBfmkjxW',
    created_at: '2026-04-11 17:12:51'
  }
];

async function importUsers() {
  console.log('=== Importing users from CSV ===\n');
  
  for (const user of csvUsers) {
    try {
      console.log(`Importing: ${user.full_name} (${user.email})`);
      
      // Check if user already exists in auth
      const { data: existingAuth, error: checkError } = await supabase
        .from('auth_users_view')
        .select('id')
        .eq('id', user.user_id)
        .maybeSingle();
      
      if (checkError) {
        console.log('  Note: Cannot check auth.users, will try to create');
      } else if (existingAuth) {
        console.log('  ⚠️  User already exists in auth, skipping');
        continue;
      }
      
      // Create user in auth.users with password hash
      // Note: Supabase doesn't support direct password hash import via API
      // We need to use raw SQL or create user with password reset
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: user.email,
        email_confirm: true,
        user_metadata: {
          full_name: user.full_name
        },
        id: user.user_id
      });
      
      if (authError) {
        console.log(`  ❌ Auth error: ${authError.message}`);
        continue;
      }
      
      console.log(`  ✅ Created auth user: ${authData.user.id}`);
      
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          user_id: authData.user.id,
          email: user.email,
          full_name: user.full_name,
          created_at: user.created_at
        }, { onConflict: 'user_id' });
      
      if (profileError) {
        console.log(`  ⚠️  Profile error: ${profileError.message}`);
      } else {
        console.log(`  ✅ Profile created`);
      }
      
      // Create user role
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert({
          user_id: authData.user.id,
          role: user.role
        }, { onConflict: 'user_id' });
      
      if (roleError) {
        console.log(`  ⚠️  Role error: ${roleError.message}`);
      } else {
        console.log(`  ✅ Role created: ${user.role}`);
      }
      
    } catch (error) {
      console.log(`  ❌ Unexpected error: ${error}`);
    }
    
    console.log('');
  }
  
  console.log('=== Import complete ===');
}

importUsers();
