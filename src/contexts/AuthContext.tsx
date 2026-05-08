'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authClient, type AuthUser } from '@/lib/auth/auth';
import { userService } from '@/lib/database/services';
import type { User } from '@/types';

interface AuthContextType {
  user: AuthUser | null;
  userProfile: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (data: any) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshProfile = async () => {
    if (user) {
      try {
        const profile = await userService.getUser(user.id);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  useEffect(() => {
    // Get initial session
    authClient.getCurrentUser().then((user) => {
      setUser(user);
      if (user) {
        refreshProfile();
      }
      setLoading(false);
    });

    // Listen for auth changes
    const subscription = authClient.onAuthStateChange(async (user) => {
      setUser(user);
      if (user) {
        await refreshProfile();
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      // Clean up the Supabase auth subscription
      if (subscription && subscription.data && subscription.data.subscription) {
        subscription.data.subscription.unsubscribe();
      }
    };
  }, [refreshProfile]);

  useEffect(() => {
    if (user && !userProfile) {
      refreshProfile();
    }
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { user } = await authClient.signIn({ email, password });
    setUser(user);
  };

  const signUp = async (data: any) => {
    const { user } = await authClient.signUp(data);
    setUser(user);
  };

  const signOut = async () => {
    await authClient.signOut();
    setUser(null);
    setUserProfile(null);
  };

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
