import {
    createUserWithEmailAndPassword,
    deleteUser,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    type User,
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const resetPassword = useCallback(async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  }, []);

  const deleteAccount = useCallback(async () => {
    if (!auth.currentUser) {
      throw new Error('No signed-in account found.');
    }

    await deleteUser(auth.currentUser);
  }, []);

  const signOut = useCallback(async () => {
    await firebaseSignOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, resetPassword, deleteAccount, signOut }),
    [deleteAccount, loading, resetPassword, signIn, signOut, signUp, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
