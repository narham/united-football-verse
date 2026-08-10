/**
 * Organization Context
 * 
 * Provides organization membership and organization selection context.
 * Automatically loads user's memberships and manages current organization.
 * 
 * Usage:
 * ```tsx
 * const { memberships, currentMembership, switchOrganization } = useOrganization();
 * ```
 */

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";
import type { OrganizationMembership } from "@/domain/auth/auth-types";
import type { MembershipRepository } from "@/repositories/membership/membership-repository";
import { useRepositoriesContext } from "@/lib/repositories-context";
import { useAuth } from "@/lib/auth/auth-context";

export interface OrganizationContextValue {
  // State
  memberships: OrganizationMembership[];
  currentMembership: OrganizationMembership | null;
  isLoading: boolean;
  error: string | null;

  // Operations
  switchOrganization: (organizationId: string) => Promise<OrganizationMembership>;
  refreshMemberships: () => Promise<void>;
  clearError: () => void;

  // Helpers
  getCurrentOrganizationId: () => string | null;
  getUserRoleInOrganization: (organizationId: string) => string | null;
}

const OrganizationContext = createContext<OrganizationContextValue | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

/**
 * Organization Provider Component
 * 
 * Wraps the application and provides organization context.
 * Must be placed inside AuthProvider (requires authenticated user).
 */
export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const repositories = useRepositoriesContext();
  const membershipRepository = repositories.membership;
  const { isAuthenticated } = useAuth();

  // State
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([]);
  const [currentMembership, setCurrentMembership] = useState<OrganizationMembership | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load memberships and current organization
  useEffect(() => {
    if (!isAuthenticated) {
      setMemberships([]);
      setCurrentMembership(null);
      return;
    }

    const loadMemberships = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get all memberships
        const userMemberships = await membershipRepository.listMyMemberships();
        setMemberships(userMemberships);

        // Get current membership (falls back to first active)
        const current = await membershipRepository.getCurrentMembership();
        setCurrentMembership(current);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load memberships";
        setError(errorMessage);
        console.error("Failed to load memberships:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadMemberships();
  }, [isAuthenticated, membershipRepository]);

  // Switch organization
  const switchOrganization = useCallback(
    async (organizationId: string) => {
      try {
        setIsLoading(true);
        setError(null);

        // Switch organization via repository
        const membership = await membershipRepository.switchOrganization(organizationId);
        setCurrentMembership(membership);

        return membership;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to switch organization";
        setError(errorMessage);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [membershipRepository]
  );

  // Refresh memberships
  const refreshMemberships = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const userMemberships = await membershipRepository.listMyMemberships();
      setMemberships(userMemberships);

      const current = await membershipRepository.getCurrentMembership();
      setCurrentMembership(current);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to refresh memberships";
      setError(errorMessage);
      console.error("Failed to refresh memberships:", err);
    } finally {
      setIsLoading(false);
    }
  }, [membershipRepository]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get current organization ID
  const getCurrentOrganizationId = useCallback(() => {
    return currentMembership?.organizationId ?? null;
  }, [currentMembership]);

  // Get user's role in a specific organization
  const getUserRoleInOrganization = useCallback(
    (organizationId: string) => {
      const membership = memberships.find((m) => m.organizationId === organizationId);
      return membership?.role ?? null;
    },
    [memberships]
  );

  const value: OrganizationContextValue = {
    memberships,
    currentMembership,
    isLoading,
    error,
    switchOrganization,
    refreshMemberships,
    clearError,
    getCurrentOrganizationId,
    getUserRoleInOrganization,
  };

  return (
    <OrganizationContext.Provider value={value}>{children}</OrganizationContext.Provider>
  );
}

/**
 * useOrganization Hook
 * 
 * Access organization context.
 * Must be used within an OrganizationProvider.
 */
export function useOrganization(): OrganizationContextValue {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error("useOrganization must be used within OrganizationProvider");
  }
  return context;
}
