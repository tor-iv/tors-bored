import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { useAuthStore } from '@/store/auth';
import { User } from '@/types';

export const useAuth = () => {
  const { user, userProfile, isLoading, setUser, setUserProfile, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            setUserProfile(userData);
          } else {
            const newProfile: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              displayName: firebaseUser.displayName || '',
              isAdmin: firebaseUser.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL,
              bidHistory: [],
              notifications: true,
              createdAt: new Date(),
            };
            setUserProfile(newProfile);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUserProfile(null);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setUserProfile, setLoading]);

  return {
    user,
    userProfile,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: userProfile?.isAdmin || false,
  };
};