import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTrpcClient } from '../services/trpc/client';
import { authService } from '../services/AuthService';
import type { RouterOutputs } from '../services/trpc/types';

/**
 * User type from getCurrentUser endpoint
 */
type User = RouterOutputs['user']['getCurrentUser'];

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  /**
   * Check authentication status by calling getCurrentUser
   */
  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const trpc = await getTrpcClient();
      const currentUser = await trpc.user.getCurrentUser.query();
      setUser(currentUser);
    } catch (error) {
      // User is not authenticated or token is invalid
      setUser(null);
      authService.clearToken();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update state after successful login
   */
  const login = useCallback((userData: User) => {
    setUser(userData);
  }, []);

  /**
   * Clear authentication state and redirect to login
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    navigate('/login');
  }, [navigate]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
