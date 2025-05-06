import axios from 'axios';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client
const supabase = createClient(
  'https://iwdrodqpyisgvdtzgeml.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3ZHJvZHFweWlzZ3ZkdHpnZW1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTA0ODg0MDAsImV4cCI6MjAyNjA2NDQwMH0.qgkN_0vO8-_OxsW9YwJnXluiYk3C6I0HHzQkjqVVHvM'
);

// Create an axios instance with default config
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://iwdrodqpyisgvdtzgeml.supabase.co/rest/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor to include auth token from localStorage
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// API service for applications
const applications = {
  list: async () => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },
  
  get: async (id: number) => {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  },
  
  create: async (data: any) => {
    const { data: newApplication, error } = await supabase
      .from('applications')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return newApplication;
  },
  
  update: async (id: number, data: any) => {
    const { data: updatedApplication, error } = await supabase
      .from('applications')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updatedApplication;
  }
};

// API service for user authentication
const auth = {
  login: async (credentials: { email: string; password: string }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });

    if (error) throw error;
    return data;
  },
  
  register: async (userData: { email: string; password: string; name: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
        },
      },
    });

    if (error) throw error;
    return data;
  },
  
  logout: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
  }
};

// Export the API services
const api = {
  applications,
  auth,
};

export default api;
