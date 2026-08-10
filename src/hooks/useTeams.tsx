/**
 * Team Hooks
 * TanStack Query hooks for team operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type { Team, CreateTeamInput, UpdateTeamInput, TeamStats } from "@/repositories/interfaces";

const teamKeys = {
  all: () => ["teams"],
  lists: () => [...teamKeys.all(), "list"],
  list: (clubId: string) => [...teamKeys.lists(), clubId],
  details: () => [...teamKeys.all(), "detail"],
  detail: (id: string) => [...teamKeys.details(), id],
  stats: (teamId: string, season: string) => [...teamKeys.all(), "stats", teamId, season],
};

export function useTeams() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: teamKeys.list(clubId),
    queryFn: async () => {
      return repositories.team.list(clubId);
    },
  });
}

export function useTeam(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: teamKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.team.getById(id);
    },
    enabled: !!id,
  });
}

export function useTeamStats(teamId: string | undefined, season: string) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: teamKeys.stats(teamId || "", season),
    queryFn: async (): Promise<TeamStats> => {
      if (!teamId) return { apps: 0, goals: 0, assists: 0 };
      return repositories.team.getStats(teamId, season);
    },
    enabled: !!teamId,
  });
}

export function useCreateTeam() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      return repositories.team.create(clubId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all() });
    },
  });
}

export function useUpdateTeam() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTeamInput;
    }) => {
      return repositories.team.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: teamKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: teamKeys.lists() });
    },
  });
}

export function useDeleteTeam() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.team.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all() });
    },
  });
}
