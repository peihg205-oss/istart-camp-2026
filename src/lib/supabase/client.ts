// ==============================================================================
// Supabase Browser Client
// ==============================================================================
import { createBrowserClient } from '@supabase/ssr';

const DEFAULT_SUPABASE_URL = 'https://lvhwrsicajvocncvwykz.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx2aHdyc2ljYWp2b2NuY3Z3eWt6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyNzcxODAsImV4cCI6MjEwNTg1MzE4MH0.9inBxLjiByP6zHis12uUbCHtiexIVSGbrxDyz14bkkY';

export function createClient() {
  let supabaseUrl = (process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL).trim();
  const supabaseAnonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY).trim();

  // Strip trailing /rest/v1/ or /rest/v1 or trailing slashes if user pasted REST endpoint instead of base URL
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');

  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project')) {
    return null;
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
