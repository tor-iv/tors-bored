import { create } from 'zustand';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types';

interface AuthState {
  user: SupabaseUser | null;
  userProfile: User | null;
  isLoading: boolean;
  setUser: (user: SupabaseUser | null) => void;
  setUserProfile: (profile: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  userProfile: null,
  isLoading: true,
  setUser: (user) => set({ user }),
  setUserProfile: (userProfile) => set({ userProfile }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: () => set({ user: null, userProfile: null }),
}));