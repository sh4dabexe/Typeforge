import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, googleProvider } from '../config/firebase';
import { UserProfile, TypingResult } from '../types';
import {
  getUserProfile,
  createOrUpdateUserProfile,
  saveTestResultToFirestore,
  deleteUserAccountData,
} from '../services/firestoreService';
import { getSyncQueue, clearSyncQueue, getLocalHistory } from '../utils/storage';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<UserProfile | null>;
  signOutUser: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfileState: (profile: UserProfile) => void;
  deleteAccount: () => Promise<boolean>;
  authError: string | null;
  clearAuthError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const refreshProfile = async () => {
    if (!user) return;
    try {
      const p = await getUserProfile(user.uid);
      if (p) {
        setProfile(p);
      }
    } catch (err) {
      console.warn('Error refreshing profile:', err);
    }
  };

  useEffect(() => {
    if (!auth || !auth.onAuthStateChanged) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userProf = await createOrUpdateUserProfile(currentUser.uid, {
            displayName: currentUser.displayName,
            email: currentUser.email,
            photoURL: currentUser.photoURL,
          });
          setProfile(userProf);

          // Flush any offline test results queued locally
          const queue = getSyncQueue();
          if (queue.length > 0) {
            let currentP = userProf;
            for (const item of queue) {
              const res = await saveTestResultToFirestore(currentUser.uid, item, currentP);
              currentP = res.updatedProfile;
            }
            clearSyncQueue();
            setProfile(currentP);
          }
        } catch (err) {
          console.warn('Auth state profile load warning:', err);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async (): Promise<UserProfile | null> => {
    setAuthError(null);
    try {
      if (!auth || !auth.app) {
        throw new Error('Firebase Auth is initializing. Please check configuration.');
      }
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        const userProf = await createOrUpdateUserProfile(result.user.uid, {
          displayName: result.user.displayName,
          email: result.user.email,
          photoURL: result.user.photoURL,
        });
        setProfile(userProf);
        return userProf;
      }
      return null;
    } catch (err: unknown) {
      const error = err as { code?: string; message?: string };
      console.error('Google Sign-in failed:', err);
      if (error.code === 'auth/popup-closed-by-user') {
        setAuthError('Sign-in cancelled');
      } else if (error.code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by browser. Please enable popups.');
      } else {
        setAuthError(error.message || 'Failed to sign in with Google');
      }
      return null;
    }
  };

  const signOutUser = async () => {
    try {
      if (auth) {
        await signOut(auth);
      }
      setUser(null);
      setProfile(null);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const deleteAccount = async (): Promise<boolean> => {
    if (!user) return false;
    try {
      const success = await deleteUserAccountData(user.uid);
      if (success) {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error deleting account:', err);
      return false;
    }
  };

  const clearAuthError = () => setAuthError(null);

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signInWithGoogle,
        signOutUser,
        refreshProfile,
        updateProfileState: (p) => setProfile(p),
        deleteAccount,
        authError,
        clearAuthError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
