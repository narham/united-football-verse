/**
 * Competition Hooks
 * TanStack Query hooks for competition operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type {
  Competition,
  CreateCompetitionInput,
  UpdateCompetitionInput,
} from "@/repositories/interfaces";

const competitionKeys = {
  all: () => ["competitions"],
  lists: () => [...competitionKeys.all(), "list"],
  list: () => [...competitionKeys.lists()],
  details: () => [...competitionKeys.all(), "detail"],
  detail: (id: string) => [...competitionKeys.details(), id],
};

export function useCompetitions() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: competitionKeys.list(),
    queryFn: async () => {
      return repositories.competition.list("club-default");
    },
  });
}

export function useCompetition(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: competitionKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.competition.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateCompetition() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateCompetitionInput) => {
      return repositories.competition.create("club-default", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.all() });
    },
  });
}

export function useUpdateCompetition() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateCompetitionInput;
    }) => {
      return repositories.competition.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() });
    },
  });
}

export function useDeleteCompetition() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.competition.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.all() });
    },
  });
}
