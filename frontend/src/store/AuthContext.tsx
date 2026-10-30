import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { getSessions, getSessionDetails } from '../services/api';
import { useAppStore } from './useAppStore';

const GUEST_STORAGE_KEY = 'data_analytics_guest_mode';

const GUEST_USER: User = {
  id: 'local-dev-user',
  app_metadata: {},
  user_metadata: { name: 'Guest Developer' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'local@dev.com',
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isGuest: boolean;
  continueAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  isGuest: false,
  continueAsGuest: () => {},
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState<boolean>(() => {
    return localStorage.getItem(GUEST_STORAGE_KEY) === 'true';
  });

  const recoverSession = async () => {
    try {
      const store = useAppStore.getState();
      // If we have a cached session, verify it's valid for this user
      if (store.sessionId) {
        try {
          await getSessionDetails(store.sessionId);
          return; // Session is valid and loaded
        } catch (err) {
          console.warn("Cached session invalid or belongs to another user. Clearing.");
          store.setSessionId(null);
          store.setUploadedFiles([]);
          store.clearMessages();
        }
      }
      
      const sessions = await getSessions();
      if (Array.isArray(sessions) && sessions.length > 0) {
        // Sort by last_active descending and pick the latest
        const latest = sessions.sort((a, b) => new Date(b.last_active).getTime() - new Date(a.last_active).getTime())[0];
        if (latest?.session_id) {
          const details = await getSessionDetails(latest.session_id);
          store.switchSession(details.session_id, details.files || []);
        }
      }
    } catch (err) {
      console.warn("Session recovery skipped:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Safety fallback timeout: loading MUST resolve within 3 seconds so the app never hangs on white screen
    const safetyTimer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 3000);

    // If guest mode was previously chosen, initialize guest user
    if (localStorage.getItem(GUEST_STORAGE_KEY) === 'true') {
      setIsGuest(true);
      setUser(GUEST_USER);
      setLoading(false);
      clearTimeout(safetyTimer);
      recoverSession();
      return;
    }

    // If Supabase is not configured, fall back to guest mode immediately
    if (!isSupabaseConfigured) {
      setIsGuest(true);
      setUser(GUEST_USER);
      setLoading(false);
      clearTimeout(safetyTimer);
      return;
    }

    // Get initial session from Supabase
    supabase.auth.getSession()
      .then(({ data: { session: currentSession } }) => {
        if (!isMounted) return;
        clearTimeout(safetyTimer);
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        if (currentSession?.user) {
          recoverSession();
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        clearTimeout(safetyTimer);
        console.warn('Supabase auth getSession failed:', err);
        setLoading(false);
      });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      setUser(newSession?.user ?? (isGuest ? GUEST_USER : null));
      setLoading(false);
      if (newSession?.user) {
        setIsGuest(false);
        localStorage.removeItem(GUEST_STORAGE_KEY);
        recoverSession();
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(safetyTimer);
      subscription.unsubscribe();
    };
  }, [isGuest]);

  const continueAsGuest = () => {
    localStorage.setItem(GUEST_STORAGE_KEY, 'true');
    setIsGuest(true);
    setUser(GUEST_USER);
    setSession(null);
    setLoading(false);
    recoverSession();
  };

  const signOut = async () => {
    localStorage.removeItem(GUEST_STORAGE_KEY);
    setIsGuest(false);
    setSession(null);
    setUser(null);
    const store = useAppStore.getState();
    store.setSessionId(null);
    store.setUploadedFiles([]);
    store.clearMessages();
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (e) {
      console.warn("Sign out error:", e);
    }
  };

  return (
    <AuthContext.Provider value={{ session, user, loading, isGuest, continueAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
