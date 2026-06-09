import { createClient } from '@supabase/supabase-js';

// Direct hardcoded values - Capacitor doesn't reliably load env vars
const supabaseUrl = 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTc1NDgsImV4cCI6MjA5MDE5MzU0OH0.IB7XhBjJlckK0N0NF2tXeWrbqYjoyWtFk5vxiGGh-L0';

console.log('[DEBUG] Supabase URL:', supabaseUrl);
console.log('[DEBUG] Supabase Key length:', supabaseAnonKey.length);

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test connection
supabase.from('books').select('count', { count: 'exact', head: true }).then(({ count, error }) => {
  console.log('[DEBUG] Books count:', count, 'Error:', error);
});
