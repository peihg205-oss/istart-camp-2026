// ==============================================================================
// Supabase Browser Client
// ==============================================================================
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '').trim();

  // Strip trailing /rest/v1/ or /rest/v1 or trailing slashes if user pasted REST endpoint instead of base URL
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    // Return null or dummy client if env not configured
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
