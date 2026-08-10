/**
 * Team Hooks
 * TanStack Query hooks for team operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type { Team, CreateTeamInput, UpdateTeamInput } from "@/repositories/interfaces";

const teamKeys = {
  all: () => ["teams"],
  lists: () => [...teamKeys.all(), "list"],
  list: () => [...teamKeys.lists()],
  details: () => [...teamKeys.all(), "detail"],
  detail: (id: string) => [...teamKeys.details(), id],
};

export function useTeams() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: teamKeys.list(),
    queryFn: async () => {
      return repositories.team.list("club-default");
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

export function useCreateTeam() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTeamInput) => {
      return repositories.team.create("club-default", input);
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
