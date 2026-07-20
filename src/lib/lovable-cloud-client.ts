import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://rcralnajyjodfdbnuvdq.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcmFsbmFqeWpvZGZkYm51dmRxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwOTcyMTQsImV4cCI6MjA4NDY3MzIxNH0.MJ7i5S70t4RGHxLYIfUD-Dsf1SznGu7V-Worlih_etE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);