import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Auth helper functions
export const auth = {
    async signUp(email: string, password: string) {
          const { data, error } = await supabase.auth.signUp({
                  email,
                  password,
          });
          return { data, error };
    },

    async signIn(email: string, password: string) {
          const { data, error } = await supabase.auth.signInWithPassword({
                  email,
                  password,
          });
          return { data, error };
    },

    async signOut() {
          const { error } = await supabase.auth.signOut();
          return { error };
    },

    async getCurrentUser() {
          const {
                  data: { user },
                  error,
          } = await supabase.auth.getUser();
          return { user, error };
    },

    async resetPassword(email: string) {
          const { data, error } = await supabase.auth.resetPasswordForEmail(email);
          return { data, error };
    },
};
