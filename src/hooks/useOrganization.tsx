/**
 * Organization Hooks
 * TanStack Query hooks for club/organization operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type { Club } from "@/repositories/interfaces";

const organizationKeys = {
  all: () => ["organization"],
  clubs: () => [...organizationKeys.all(), "clubs"],
  club: (clubId: string) => [...organizationKeys.all(), "club", clubId],
};

export function useClub(overrideClubId?: string) {
  const repositories = useRepositories();
  const ctxClubId = useCurrentOrganizationId();
  const clubId = overrideClubId || ctxClubId;

  return useQuery({
    queryKey: organizationKeys.club(clubId),
    queryFn: async () => {
      return repositories.organization.getClub(clubId);
    },
  });
}

export function useClubs() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: organizationKeys.clubs(),
    queryFn: async () => {
      return repositories.organization.getClubs();
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
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.club(variables.clubId) });
      queryClient.invalidateQueries({ queryKey: organizationKeys.clubs() });
    },
  });
}
