import type { User } from "@supabase/supabase-js";
import { create } from "zustand";
import { supabase, supabaseConfigured } from "../lib/supabase";

type AuthState = {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<string | null>;
  signUp: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: supabaseConfigured,
  initialized: false,
  initialize: async () => {
    if (get().initialized) return;
    set({ initialized: true });
    if (!supabaseConfigured) {
      set({ loading: false });
      return;
    }
    const { data } = await supabase.auth.getSession();
    set({ user: data.session?.user ?? null, loading: false });
    supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });
  },
  signIn: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },
  signUp: async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return error?.message ?? null;
  },
  signOut: async () => {
    if (supabaseConfigured) await supabase.auth.signOut();
    set({ user: null });
  },
}));
