/**
 * Supabase Client Configuration
 * 
 * Browser-safe Supabase client using anon key for RLS enforcement.
 * 
 * Environment Variables Required:
 * - VITE_SUPABASE_URL: Supabase project URL
 * - VITE_SUPABASE_ANON_KEY: Supabase anonymous key (public)
 * 
 * WARNING: Never expose service-role keys to the browser.
 * Service-role operations are handled server-side only.
 */

import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Get Supabase URL from environment
 */
function getSupabaseUrl(): string {
  const url = import.meta.env["VITE_SUPABASE_URL"];
  if (!url) {
    throw new Error("VITE_SUPABASE_URL environment variable is not set");
  }
  return url;
}

/**
 * Get Supabase anon key from environment
 */
function getSupabaseAnonKey(): string {
  const key = import.meta.env["VITE_SUPABASE_ANON_KEY"];
  if (!key) {
    throw new Error("VITE_SUPABASE_ANON_KEY environment variable is not set");
  }
  return key;
}

/**
 * Supabase client instance (singleton)
 * 
 * Uses anonymous key for all client-side operations.
 * RLS policies enforce authorization at the database level.
 */
let supabaseClient: SupabaseClient | null = null;

/**
 * Initialize and return Supabase client
 * 
 * @throws Error if environment variables are not configured
 */
export function getSupabaseClient(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }

  try {
    supabaseClient = createClient(getSupabaseUrl(), getSupabaseAnonKey(), {
      auth: {
        // Enable persistent session storage
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
      // Global fetch options
      global: {
        headers: {
          // Custom headers can be added here if needed
        },
      },
    });

    return supabaseClient;
  } catch (error) {
    throw new Error(`Failed to initialize Supabase client: ${error}`);
  }
}

/**
 * Check if Supabase is configured
 */
export function isSupabaseConfigured(): boolean {
  try {
    return !!import.meta.env["VITE_SUPABASE_URL"] && !!import.meta.env["VITE_SUPABASE_ANON_KEY"];
  } catch {
    return false;
  }
}

/**
 * Get Supabase client with error handling
 * 
 * Returns null if not configured (allows graceful degradation)
 */
export function tryGetSupabaseClient(): SupabaseClient | null {
  try {
    return getSupabaseClient();
  } catch {
    console.warn("Supabase not configured. Using demo mode.");
    return null;
  }
}
