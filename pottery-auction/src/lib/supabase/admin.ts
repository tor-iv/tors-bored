import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

/**
 * Admin Supabase Client
 *
 * This client uses the SERVICE ROLE KEY which bypasses Row Level Security (RLS).
 *
 * ⚠️ SECURITY WARNING:
 * - Only use this in server-side code (API routes, server components)
 * - NEVER expose this client to the browser/frontend
 * - Has full admin access to all data regardless of RLS policies
 *
 * Use cases:
 * - Admin operations (viewing all bids, all commissions)
 * - System operations (auction settlement, automated tasks)
 * - Operations that need to bypass RLS
 */
export function createAdminClient() {
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables');
  }

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
}
