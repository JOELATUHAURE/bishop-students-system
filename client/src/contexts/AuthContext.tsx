import React, { createContext, useContext, useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../services/api';

// Types
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  roles: string[];
  settlementSite?: string;
  preferredLanguage?: string;
}

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
  token: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  settlementSite?: string;
  preferredLanguage?: string;
}

interface DecodedToken {
  id: string;
  exp: number;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    token: null,
  });

  // Check if token is valid
  const isTokenValid = (token: string): boolean => {
    try {
      const decoded = jwtDecode<DecodedToken>(token);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      return false;
    }
  };

  // Initialize auth state
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      
      if (token && isTokenValid(token)) {
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        try {
          const response = await api.get('/api/auth/me');
          
          setState({
            isAuthenticated: true,
            isLoading: false,
            user: response.data.data,
            token,
          });
        } catch (error) {
          localStorage.removeItem('token');
          delete api.defaults.headers.common['Authorization'];
          
          setState({
            isAuthenticated: false,
            isLoading: false,
            user: null,
            token: null,
          });
        }
      } else {
        localStorage.removeItem('token');
        delete api.defaults.headers.common['Authorization'];
        
        setState({
          isAuthenticated: false,
          isLoading: false,
          user: null,
          token: null,
        });
      }
    };
    
    initializeAuth();
  }, []);

  // Login
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await api.post('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });
    } catch (error) {
      throw error;
    }
  };

  // Register
  const register = async (userData: RegisterData): Promise<void> => {
    try {
      const response = await api.post('/api/auth/register', userData);
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      setState({
        isAuthenticated: true,
        isLoading: false,
        user,
        token,
      });
    } catch (error) {
      throw error;
    }
  };

  // Logout
  const logout = (): void => {
    localStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
    
    setState({
      isAuthenticated: false,
      isLoading: false,
      user: null,
      token: null,
    });
  };

  // Update user
  const updateUser = (userData: Partial<User>): void => {
    if (state.user) {
      setState({
        ...state,
        user: { ...state.user, ...userData },
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};