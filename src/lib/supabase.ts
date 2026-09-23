/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const env = (key: string) => (typeof window !== 'undefined' && (window as any).ENV?.[key]) || (import.meta.env as any)[key];
const supabaseUrl = env('VITE_SUPABASE_URL') as string;
const supabaseAnonKey = env('VITE_SUPABASE_ANON_KEY') as string;

if (!supabaseUrl || !supabaseAnonKey) throw new Error('VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY wajib diisi.');

export const hasPublicAuth = true;
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    storageKey: 'cde-auth-token-v1',
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});
