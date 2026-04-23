import { File, Paths } from 'expo-file-system';
import {
    createUserWithEmailAndPassword,
    deleteUser,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    sendPasswordResetEmail,
    signInWithEmailAndPassword,
    updateProfile,
    type User,
} from 'firebase/auth';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { auth } from '@/lib/firebase';

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  firstName: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, firstName: string) => Promise<void>;
  updateFirstName: (firstName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const authProfileFile = new File(Paths.document, 'streamline-tv-auth-profile.json');

function getAccountKey(email?: string | null) {
  return email?.trim().toLowerCase() || null;
}

async function readProfileStore(): Promise<Record<string, string>> {
  if (!authProfileFile.exists) {
    return {};
  }

  const raw = await authProfileFile.text();

  if (!raw.trim()) {
    return {};
  }

  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === 'string' && value.trim().length > 0),
    ) as Record<string, string>;
  } catch (error) {
    console.error('Failed to parse local auth profile store', error);
    return {};
  }
}

async function saveFirstName(email: string, firstName: string) {
  const accountKey = getAccountKey(email);

  if (!accountKey) {
    return;
  }

  const store = await readProfileStore();
  store[accountKey] = firstName.trim();
  authProfileFile.write(JSON.stringify(store, null, 2));
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [firstName, setFirstName] = useState<string | null>(null);

  useEffect(() => onAuthStateChanged(auth, (nextUser) => {
    setUser(nextUser);
    setLoading(false);
  }), []);

  useEffect(() => {
    let active = true;

    async function loadFirstName(nextUser: User | null) {
      if (!nextUser) {
        if (active) {
          setFirstName(null);
        }
        return;
      }

      const accountKey = getAccountKey(nextUser.email);
      const fallbackName = nextUser.displayName?.trim() || null;

      if (!accountKey) {
        if (active) {
          setFirstName(fallbackName);
        }
        return;
      }

      try {
        const store = await readProfileStore();
        const storedName = store[accountKey]?.trim() || null;
        if (active) {
          setFirstName(storedName || fallbackName);
        }

        if (!storedName && fallbackName) {
          await saveFirstName(nextUser.email ?? '', fallbackName);
        }
      } catch (error) {
        console.error('Failed to load local auth profile store', error);
        if (active) {
          setFirstName(fallbackName);
        }
      }
    }

    void loadFirstName(user);

    return () => {
      active = false;
    };
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email.trim(), password);
  }, []);

  const signUp = useCallback(async (email: string, password: string, firstName: string) => {
    const credentials = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const trimmedFirstName = firstName.trim();

    if (trimmedFirstName) {
      await updateProfile(credentials.user, { displayName: trimmedFirstName });
      await saveFirstName(email, trimmedFirstName);
    }
  }, []);

  const updateFirstName = useCallback(async (nextFirstName: string) => {
    const trimmedFirstName = nextFirstName.trim();

    if (!auth.currentUser?.email) {
      throw new Error('No signed-in account found.');
    }

    if (!trimmedFirstName) {
      throw new Error('Enter a first name.');
    }

    await updateProfile(auth.currentUser, { displayName: trimmedFirstName });
    await saveFirstName(auth.currentUser.email, trimmedFirstName);
    setFirstName(trimmedFirstName);
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
    () => ({ user, loading, firstName, signIn, signUp, updateFirstName, resetPassword, deleteAccount, signOut }),
    [deleteAccount, firstName, loading, resetPassword, signIn, signOut, signUp, updateFirstName, user],
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
