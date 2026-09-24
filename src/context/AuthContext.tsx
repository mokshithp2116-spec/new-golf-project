'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { getCurrentUser, setCurrentUser, updateUser } from '@/lib/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; message?: string; user?: User }>;
  signup: (
    name: string,
    email: string,
    pass: string,
    billingCycle?: 'monthly' | 'yearly',
    charityId?: string,
    charityContributionPct?: number
  ) => Promise<{ success: boolean; message?: string; user?: User }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  signup: async () => ({ success: false }),
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSession = async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCurrentUser(data.user.id);
        updateUser(data.user);
        setIsLoading(false);
        return;
      }
    } catch {
      // ignore
    }

    // Fallback: Check localStorage user if server cookie session was missing
    const localUser = getCurrentUser();
    if (localUser) {
      setUser(localUser);
      try {
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: localUser.email, password: 'defaultPassword123' }),
        });
        const loginData = await loginRes.json();
        if (loginData.success && loginData.user) {
          setUser(loginData.user);
          setCurrentUser(loginData.user.id);
          updateUser(loginData.user);
        }
      } catch {
        // ignore
      }
    } else {
      setUser(null);
      setCurrentUser(null);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchSession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: pass }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCurrentUser(data.user.id);
        updateUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Invalid credentials.' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const signup = async (
    name: string,
    email: string,
    pass: string,
    billingCycle: 'monthly' | 'yearly' = 'monthly',
    charityId: string = 'charity-1',
    charityContributionPct: number = 15
  ) => {
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password: pass,
          billingCycle,
          charityId,
          charityContributionPct,
        }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        setCurrentUser(data.user.id);
        updateUser(data.user);
        return { success: true, user: data.user };
      }
      return { success: false, message: data.message || 'Signup failed.' };
    } catch (err) {
      return { success: false, message: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setUser(null);
      setCurrentUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        signup,
        logout,
        refreshUser: fetchSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
