/**
 * useRepositories Hook
 * Convenient access to all repositories
 */

import { useRepositoriesContext } from "@/lib/repositories-context";

export function useRepositories() {
  return useRepositoriesContext();
}
