'use client';

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getCurrentSession, signOut as signOutAction } from '@/lib/actions/auth';
import type { AuthUser, Profile } from '@/lib/types';

interface AuthContextValue {
  user: AuthUser | null;
  profile: Profile | null;
  initials: string;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function getInitials(profile: Profile | null) {
  if (!profile) return 'NN';
  if (profile.first_name && profile.last_name) {
    return `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase();
  }
  return (profile.email || 'NN').slice(0, 2).toUpperCase();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const session = await getCurrentSession();
    setUser(session?.user ?? null);
    setProfile(session?.profile ?? null);
    setLoading(false);
  }, []);

  const signOut = useCallback(async () => {
    await signOutAction();
    setUser(null);
    setProfile(null);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <AuthContext.Provider value={{ user, profile, initials: getInitials(profile), loading, refresh, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}
