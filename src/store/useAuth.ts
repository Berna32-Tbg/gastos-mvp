import { create } from 'zustand';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../core/supabase';
import { loginSchema, firstError } from '../core/validators';
import { resetDb } from '../data/db';

interface AuthState {
  session: Session | null; ready: boolean; loading: boolean; error?: string;
  init: () => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

export const useAuth = create<AuthState>((set) => ({
  session: null, ready: false, loading: false,
  init: () => {
    supabase.auth.getSession().then(({ data }) => set({ session: data.session, ready: true }));
    supabase.auth.onAuthStateChange((_e, session) => set({ session }));
  },
  signIn: async (email, password) => {
    set({ loading: true, error: undefined });
    try {
      const v = loginSchema.parse({ email, password });
      const { error } = await supabase.auth.signInWithPassword(v);
      if (error) throw error;
    } catch (e) { set({ error: firstError(e) }); }
    set({ loading: false });
  },
  signUp: async (email, password) => {
    set({ loading: true, error: undefined });
    let msg: string | null = null;
    try {
      const v = loginSchema.parse({ email, password });
      const { data, error } = await supabase.auth.signUp(v);
      if (error) throw error;
      if (!data.session) msg = 'Revisa tu correo para confirmar la cuenta.';
    } catch (e) { set({ error: firstError(e) }); }
    set({ loading: false });
    return msg;
  },
  signOut: async () => { await supabase.auth.signOut(); await resetDb(); },
}));
