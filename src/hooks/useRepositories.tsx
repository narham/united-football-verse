/**
 * useRepositories Hook
 * Convenient access to all repositories
 */

import { useRepositoriesContext } from "@/lib/repositories-context";
import { useOrganization } from "@/lib/auth/organization-context";
import { DEFAULT_CLUB_ID } from "@/lib/demo-data";

export function useRepositories() {
  return useRepositoriesContext();
}

/**
 * useCurrentOrganizationId Hook
 * Resolves the canonical organization ID for the current user context.
 * Priority:
 *   1. Organization context (user's active membership)
 *   2. DEFAULT_CLUB_ID from demo-data contract
 *
 * This value MUST be used in every repository method call instead of
 * hardcoded strings. Guarantees P0 tenant isolation.
 */
export function useCurrentOrganizationId(): string {
  const { getCurrentOrganizationId } = useOrganization();
  const ctxId = getCurrentOrganizationId();
  return ctxId || DEFAULT_CLUB_ID;
}
