import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { onAuthChange, isDemoMode } from '../services/firebase';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [userProfile,  setUserProfile]  = useState(null);
  const [loading,      setLoading]      = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const data = await getMe();
      setUserProfile(data.user);
    } catch {
      setUserProfile(null);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthChange(async (user) => {
      setFirebaseUser(user);
      if (user) {
        await fetchProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, [fetchProfile]);

  const refreshProfile = useCallback(() => fetchProfile(), [fetchProfile]);

  const value = {
    firebaseUser,
    userProfile,
    loading,
    isAuthenticated:  !!firebaseUser,
    isEmailVerified:  firebaseUser?.emailVerified ?? false,
    needsOnboarding:  firebaseUser && !userProfile?.onboardingCompleted,
    isDemoMode,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
