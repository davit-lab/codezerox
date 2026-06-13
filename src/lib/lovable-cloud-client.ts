import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://cnkhdwcqfxkdmluvikzv.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNua2hkd2NxZnhrZG1sdXZpa3p2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ2MTc1NDgsImV4cCI6MjA5MDE5MzU0OH0.IB7XhBjJlckK0N0NF2tXeWrbqYjoyWtFk5vxiGGh-L0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);