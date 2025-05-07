import { createClient } from '@supabase/supabase-js';

// Default values for development
const defaultSupabaseUrl = 'https://iwdrodqpyisgvdtzgeml.supabase.co';
const defaultSupabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZHJvZHFweWlzZ3ZkdHpnZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjk4NTksImV4cCI6MjA2MTk0NTg1OX0.HBcMnVGuG7fLaCallp6TTRYOhBtoh3SAOFZnngF_A1s';

// Get environment variables with fallbacks
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || defaultSupabaseUrl;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || defaultSupabaseAnonKey;

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
