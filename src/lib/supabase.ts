import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseUrl !== 'https://your-project-id.supabase.co' &&
    supabaseAnonKey &&
    supabaseAnonKey !== 'your-anon-key-here'
);

/**
 * Public Supabase client for client-side interactions
 */
export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Server-only Supabase Admin client with Service Role privileges
 * NEVER expose this or use it on the client side!
 */
export function getSupabaseAdmin() {
  if (typeof window !== 'undefined') {
    throw new Error('Security Violation: getSupabaseAdmin() must never be called on the client!');
  }

  if (!isSupabaseConfigured || !supabaseServiceRoleKey || supabaseServiceRoleKey === 'your-service-role-key-here') {
    return null;
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
