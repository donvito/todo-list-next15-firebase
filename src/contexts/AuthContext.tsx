'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { User, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    console.log('Setting up auth state listener'); // Debug log
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      console.log('Auth state changed:', user ? 'logged in' : 'logged out'); // Debug log
      setUser(user);
      setLoading(false);
    });

    return () => {
      console.log('Cleaning up auth state listener'); // Debug log
      unsubscribe();
    };
  }, []);

  const signOut = async () => {
    try {
      console.log('Signing out...'); // Debug log
      await firebaseSignOut(auth);
      console.log('Successfully signed out'); // Debug log
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signOut
  };

  console.log('Auth context state:', { user: !!user, loading }); // Debug log

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext); 