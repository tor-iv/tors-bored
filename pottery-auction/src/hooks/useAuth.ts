import { useEffect, useCallback } from 'react';
import { useAuthStore, type AuthUser } from '@/store/auth';

export const refreshAuth = async (): Promise<AuthUser | null> => {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) return null;
    const data = await res.json() as { user: AuthUser | null };
    return data.user ?? null;
  } catch {
    return null;
  }
};

export const useAuth = () => {
  const { user, isLoading, setUser, setLoading } = useAuthStore();

  const refresh = useCallback(async () => {
    const fetchedUser = await refreshAuth();
    setUser(fetchedUser);
    setLoading(false);
  }, [setUser, setLoading]);

  useEffect(() => {
    refresh();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    user,
    // Alias for backward compat with callers that destructure `userProfile`
    userProfile: user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: !!user?.isAdmin,
    refresh,
  };
};
