import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iwdrodqpyisgvdtzgeml.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZHJvZHFweWlzZ3ZkdHpnZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzNjk4NTksImV4cCI6MjA2MTk0NTg1OX0.HBcMnVGuG7fLaCallp6TTRYOhBtoh3SAOFZnngF_A1s';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
