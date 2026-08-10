/**
 * Repositories Context
 * Provides repository access to all components via React Context
 * 
 * Supports automatic switching between:
 * - Demo repositories (localStorage, browser-based)
 * - Supabase repositories (PostgreSQL, real backend)
 */

import { createContext, useContext, ReactNode, useMemo } from "react";
import type { Repositories } from "@/repositories/interfaces";
import { createDemoRepositories } from "@/repositories/demo";
import { createSupabaseRepositories } from "@/repositories/supabase";
import { tryGetSupabaseClient } from "./supabase/client";

// Create context
const RepositoriesContext = createContext<Repositories | null>(null);

// Context provider props
interface RepositoriesProviderProps {
  children: ReactNode;
  clubId?: string;
  forceDemo?: boolean; // Force demo mode even if Supabase is configured
}

/**
 * Repository Provider Component
 * Wraps application with repository access
 * 
 * Automatically selects implementation based on Supabase configuration
 */
export function RepositoriesProvider({
  children,
  clubId = "club-default",
  forceDemo = false,
}: RepositoriesProviderProps) {
  // Determine which repositories to use
  const repositories = useMemo(() => {
    // Check if Supabase is configured and not forced to demo mode
    if (!forceDemo) {
      const supabaseClient = tryGetSupabaseClient();
      if (supabaseClient) {
        console.log("✅ Using Supabase repositories");
        return createSupabaseRepositories(supabaseClient, clubId);
      }
    }

    // Fall back to demo mode
    console.log("📱 Using demo repositories (localStorage)");
    return createDemoRepositories(clubId);
  }, [clubId, forceDemo]);

  return (
    <RepositoriesContext.Provider value={repositories}>
      {children}
    </RepositoriesContext.Provider>
  );
}

/**
 * Hook to access repositories from context
 * Throws if used outside RepositoriesProvider
 */
export function useRepositoriesContext(): Repositories {
  const context = useContext(RepositoriesContext);
  if (!context) {
    throw new Error(
      "useRepositoriesContext must be used within RepositoriesProvider"
    );
  }
  return context;
}
