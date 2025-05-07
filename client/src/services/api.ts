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
  timeout: 10000,
});

// Add request interceptor to include auth token from localStorage
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add response interceptor for better error handling
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
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
    try {
      console.log('Attempting login with email:', credentials.email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('Login error:', error);
        throw error;
      }

      console.log('Login successful:', { user: data.user?.id });
      return data;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  },
  
  register: async (userData: { email: string; password: string; name: string }) => {
    try {
      console.log('Attempting registration for:', userData.email);
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
        },
      });

      if (error) {
        console.error('Registration error:', error);
        throw error;
      }

      console.log('Registration successful:', { user: data.user?.id });
      return data;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  },
  
  logout: async () => {
    try {
      console.log('Attempting logout');
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        throw error;
      }
      localStorage.removeItem('token');
      console.log('Logout successful');
    } catch (error) {
      console.error('Logout failed:', error);
      throw error;
    }
  },

  // Add method to check auth status
  checkAuth: async () => {
    try {
      console.log('Checking auth status');
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Auth check error:', error);
        throw error;
      }

      console.log('Auth check result:', { hasSession: !!session });
      return session;
    } catch (error) {
      console.error('Auth check failed:', error);
      throw error;
    }
  }
};

// Export the API services
const api = {
  instance,
  applications,
  auth,
};

export default api;
