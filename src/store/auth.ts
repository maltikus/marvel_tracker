import { create } from 'zustand';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { reconcile, startPushSync, stopPushSync } from '../lib/sync';

export interface AuthUser {
  id: string;
  email: string | null;
}

type Status = 'loading' | 'signed_out' | 'signed_in';

interface AuthState {
  enabled: boolean;
  status: Status;
  user: AuthUser | null;
  error: string | null;
  info: string | null;
  busy: boolean;
  init: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  clearMessages: () => void;
}

let reconciledUser: string | null = null;
let initialised = false;

export const useAuth = create<AuthState>((set) => ({
  enabled: isSupabaseConfigured,
  status: isSupabaseConfigured ? 'loading' : 'signed_out',
  user: null,
  error: null,
  info: null,
  busy: false,

  init: () => {
    if (!supabase || initialised) return;
    initialised = true;

    supabase.auth.onAuthStateChange((event, session) => {
      const u = session?.user;
      if (u) {
        set({ user: { id: u.id, email: u.email ?? null }, status: 'signed_in' });
        if (reconciledUser !== u.id) {
          reconciledUser = u.id;
          const migrate = event === 'SIGNED_IN'; // union-merge guest progress
          void reconcile(u.id, !migrate).finally(() => startPushSync(u.id));
        }
      } else {
        reconciledUser = null;
        stopPushSync();
        set({ user: null, status: 'signed_out' });
      }
    });
  },

  signIn: async (email, password) => {
    if (!supabase) return;
    set({ busy: true, error: null, info: null });
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    set({ busy: false, error: error ? error.message : null });
  },

  signUp: async (email, password) => {
    if (!supabase) return;
    set({ busy: true, error: null, info: null });
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      set({ busy: false, error: error.message });
      return;
    }
    // When email confirmation is on, there's no session until the link is clicked.
    set({
      busy: false,
      info: data.session ? null : 'Account created — check your email to confirm, then sign in.',
    });
  },

  signOut: async () => {
    if (!supabase) return;
    stopPushSync();
    await supabase.auth.signOut();
    set({ user: null, status: 'signed_out' });
  },

  clearMessages: () => set({ error: null, info: null }),
}));
