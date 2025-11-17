import { createClient, SupabaseClient } from '@supabase/supabase-js';

/**
 * Server-side Supabase client singleton
 * This ensures we only create ONE connection pool for all API routes
 * preventing "too many connections" errors
 */

let supabaseServerInstance: SupabaseClient | null = null;

export function getSupabaseServer(): SupabaseClient {
  // Return existing instance if it exists
  if (supabaseServerInstance) {
    return supabaseServerInstance;
  }

  // Create new instance only if it doesn't exist
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Missing Supabase environment variables: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  }

  // Create singleton instance with connection pooling options
  supabaseServerInstance = createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    db: {
      schema: 'public'
    },
    global: {
      headers: {
        'X-Client-Info': 'bella-wedding-ai-server'
      }
    }
  });

  return supabaseServerInstance;
}

/**
 * Lazy-loaded Supabase client for server-side operations
 * Uses a Proxy to defer initialization until first access
 * This prevents build-time errors when env vars are not available
 */
export const supabaseServer = new Proxy({} as SupabaseClient, {
  get(target, prop) {
    const client = getSupabaseServer();
    const value = client[prop as keyof SupabaseClient];
    return typeof value === 'function' ? value.bind(client) : value;
  }
});
