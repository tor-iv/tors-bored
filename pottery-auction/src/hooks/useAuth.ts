import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuthStore } from '@/store/auth';
import { User } from '@/types';

export const useAuth = () => {
  const { user, userProfile, isLoading, setUser, setUserProfile, setLoading } = useAuthStore();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    return () => subscription.unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      if (data) {
        const userProfile: User = {
          id: data.id,
          email: data.email,
          displayName: data.display_name || '',
          isAdmin: data.is_admin,
          bidHistory: [], // TODO: Fetch from bids table later
          notifications: data.notifications,
          createdAt: new Date(data.created_at),
        };
        setUserProfile(userProfile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userProfile?.isAdmin || false,
  };
};