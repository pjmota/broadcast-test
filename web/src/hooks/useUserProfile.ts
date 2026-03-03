import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../app/providers/AuthProvider';

export interface UserProfile {
  id: string;
  email: string;
  role?: 'admin' | 'user';
  plan?: 'free' | 'pro';
  createdAt?: any;
}

export function useUserProfile() {
  const { currentUser } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setProfile(null);
      setLoading(false);
      return;
    }

    // Escuta mudanças no perfil do usuário em tempo real
    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        setProfile(doc.data() as UserProfile);
      } else {
        console.log('No user profile found');
        setProfile(null);
      }
      setLoading(false);
    }, (error) => {
      console.error("Error fetching user profile:", error);
      setLoading(false);
    });

    return unsubscribe;
  }, [currentUser]);

  return { profile, loading };
}
