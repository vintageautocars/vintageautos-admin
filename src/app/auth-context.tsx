// Auth context — exports both the provider component and the useAuth hook.
/* eslint-disable react-refresh/only-export-components */
/* oxlint-disable react/only-export-components */

import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { queryClient } from '@/lib/query-client';
import type { User } from '@/types/auth';

function extractApiMessage(err: unknown, fallback: string): Error {
  if (axios.isAxiosError(err)) {
    const data = err.response?.data as { message?: string | string[] } | undefined;
    const raw = data?.message;
    const msg = Array.isArray(raw) ? raw.join(', ') : raw;
    if (msg) return new Error(msg);
  }
  return new Error(fallback);
}

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<User | null> {
  try {
    const res = await api.get<User>('/auth/me');
    return res.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // best-effort
    }
    setUser(null);
    queryClient.clear();
  }, []);

  // Bootstrap auth state before first render completes
  useEffect(() => {
    fetchMe().then((u) => {
      setUser(u);
      setIsLoading(false);
    });
  }, []);

  // Listen for 401 → refresh failure dispatched by the axios interceptor
  useEffect(() => {
    const handler = () => void logout();
    window.addEventListener('auth:logout', handler);
    return () => window.removeEventListener('auth:logout', handler);
  }, [logout]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    try {
      await api.post('/auth/login', { email, password });
    } catch (err) {
      throw extractApiMessage(err, 'Login failed. Please try again.');
    }
    const me = await fetchMe();
    if (!me) throw new Error('Failed to retrieve user after login.');

    const isAdmin = me.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN');
    if (!isAdmin) {
      await logout();
      throw new Error('This account does not have admin access.');
    }

    setUser(me);
    return me;
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
