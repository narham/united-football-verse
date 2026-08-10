/**
 * Organization Hooks
 * TanStack Query hooks for club/organization operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type { Club } from "@/repositories/interfaces";

const organizationKeys = {
  all: () => ["organization"],
  club: () => [...organizationKeys.all(), "club"],
};

export function useClub(clubId?: string) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: organizationKeys.club(),
    queryFn: async () => {
      return repositories.organization.getClub(clubId || "club-default");
    },
  });
}

export function useUpdateClub() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      clubId,
      data,
    }: {
      clubId: string;
      data: Partial<Club>;
    }) => {
      return repositories.organization.updateClub(clubId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.club() });
    },
  });
}
