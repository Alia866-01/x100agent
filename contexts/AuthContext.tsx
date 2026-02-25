/**
 * Auth Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '../services/authService';
import type { User, ApiError } from '../types/api';

interface AuthContextType {
  user: User | null;
  tenantId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  register: (email: string, password: string, companyName: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const initAuth = () => {
      const storedUser = authService.getCurrentUser();
      const storedTenantId = authService.getTenantId();

      if (storedUser && storedTenantId) {
        setUser(storedUser);
        setTenantId(storedTenantId);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  /**
   * Login user
   */
  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(email, password);
      setUser(response.user);
      setTenantId(response.tenant_id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Login with Google OAuth
   */
  const loginWithGoogle = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      // Initiates Google OAuth flow - will redirect to Google
      await authService.loginWithGoogle();
      // After redirect back, handleOAuthCallback will be called
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Google login failed. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  /**
   * Register new user
   */
  const register = async (
    email: string,
    password: string,
    companyName: string
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(email, password, companyName);
      setUser(response.user);
      setTenantId(response.tenant_id);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.detail || 'Registration failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Logout user
   */
  const logout = (): void => {
    authService.logout();
    setUser(null);
    setTenantId(null);
    setError(null);
  };

  /**
   * Clear error message
   */
  const clearError = (): void => {
    setError(null);
  };

  const value: AuthContextType = {
    user,
    tenantId,
    isAuthenticated: !!user,
    isLoading,
    error,
    login,
    loginWithGoogle,
    register,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Hook to access auth context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
