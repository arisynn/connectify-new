import { createClient } from '@supabase/supabase-js';

let supabaseInstance: any = null;

// Supabase is the only source of truth. Missing configuration fails fast.
export function getSupabase(): any {
  if (supabaseInstance) return supabaseInstance;
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) throw new Error('SUPABASE_URL and SUPABASE_SECRET_KEY are required');
  supabaseInstance = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false, autoRefreshToken: false } });
  return supabaseInstance;
}
