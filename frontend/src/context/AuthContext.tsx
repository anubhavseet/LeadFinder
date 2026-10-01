import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, SignUpInput, LoginInput, UpdateProfileInput } from '../types';
import {
  getStoredToken,
  setStoredAuth,
  clearStoredAuth,
  loginUser,
  registerUser,
  getCurrentUser,
  updateUserProfile,
  regenerateUserApiKey,
  logoutUser,
  AUTH_USER_KEY,
} from '../api/graphqlClient';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (input: LoginInput) => Promise<void>;
  register: (input: SignUpInput) => Promise<void>;
  logout: () => void;
  updateProfile: (input: UpdateProfileInput) => Promise<User>;
  regenerateApiKey: () => Promise<User>;
  // Modal controls
  isAuthModalOpen: boolean;
  authModalTab: 'login' | 'register';
  openAuthModal: (tab?: 'login' | 'register') => void;
  closeAuthModal: () => void;
  isProfileModalOpen: boolean;
  openProfileModal: () => void;
  closeProfileModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const cached = localStorage.getItem(AUTH_USER_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Modal UI states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Sync token on mount and re-validate user with backend
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setIsLoading(false);
        return;
      }

      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        setToken(storedToken);
      } catch (err) {
        console.warn('Failed to validate active session token:', err);
        // If token is expired or backend rejected it, clear stored session
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (input: LoginInput) => {
    const res = await loginUser(input);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  }, []);

  const register = useCallback(async (input: SignUpInput) => {
    const res = await registerUser(input);
    setToken(res.token);
    setUser(res.user);
    setIsAuthModalOpen(false);
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore
    }
    clearStoredAuth();
    setToken(null);
    setUser(null);
    setIsProfileModalOpen(false);
  }, []);

  const updateProfile = useCallback(async (input: UpdateProfileInput): Promise<User> => {
    const updated = await updateUserProfile(input);
    setUser(updated);
    return updated;
  }, []);

  const regenerateApiKey = useCallback(async (): Promise<User> => {
    const updated = await regenerateUserApiKey();
    setUser(updated);
    return updated;
  }, []);

  const openAuthModal = useCallback((tab: 'login' | 'register' = 'login') => {
    setAuthModalTab(tab);
    setIsAuthModalOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    setIsAuthModalOpen(false);
  }, []);

  const openProfileModal = useCallback(() => {
    setIsProfileModalOpen(true);
  }, []);

  const closeProfileModal = useCallback(() => {
    setIsProfileModalOpen(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        regenerateApiKey,
        isAuthModalOpen,
        authModalTab,
        openAuthModal,
        closeAuthModal,
        isProfileModalOpen,
        openProfileModal,
        closeProfileModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
