import { createClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Strip trailing /rest/v1 or slashes if present
const cleanUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(cleanUrl && supabaseAnonKey && cleanUrl.startsWith('http'));

if (!isSupabaseConfigured) {
  console.warn(
    'Supabase URL or Anon Key is missing or invalid in environment variables. Local guest mode will be available.'
  );
}

// Fallback dummy URL so createClient does not crash the entire React application bundle on startup
const safeUrl = isSupabaseConfigured ? cleanUrl : 'https://placeholder-project.supabase.co';
const safeKey = isSupabaseConfigured ? supabaseAnonKey : 'placeholder-anon-key';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: isSupabaseConfigured,
  },
});
