import { create } from 'zustand';

export type AuthUser = {
  id: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  notifications?: boolean;
  hasSavedCard?: boolean;
};

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null }),
}));
