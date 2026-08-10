/**
 * Repositories Context
 * Provides repository access to all components via React Context
 */

import { createContext, useContext, ReactNode } from "react";
import type { Repositories } from "@/repositories/interfaces";
import { createDemoRepositories } from "@/repositories/demo";

// Create context
const RepositoriesContext = createContext<Repositories | null>(null);

// Context provider props
interface RepositoriesProviderProps {
  children: ReactNode;
  clubId?: string;
}

/**
 * Repository Provider Component
 * Wraps application with repository access
 */
export function RepositoriesProvider({
  children,
  clubId = "club-default",
}: RepositoriesProviderProps) {
  const repositories = createDemoRepositories(clubId);

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
