/**
 * Match Hooks
 * TanStack Query hooks for match operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type {
  Match,
  MatchListParams,
  CreateMatchInput,
  UpdateMatchInput,
} from "@/repositories/interfaces";

const matchKeys = {
  all: () => ["matches"],
  lists: () => [...matchKeys.all(), "list"],
  list: (params?: MatchListParams) => [...matchKeys.lists(), params ?? "default"],
  details: () => [...matchKeys.all(), "detail"],
  detail: (id: string) => [...matchKeys.details(), id],
  upcoming: () => [...matchKeys.all(), "upcoming"],
  past: () => [...matchKeys.all(), "past"],
};

export function useMatches(params?: MatchListParams) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: async () => {
      const result = await repositories.match.list("club-default", params);
      return result.data || [];
    },
  });
}

export function useMatch(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: matchKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.match.getById(id);
    },
    enabled: !!id,
  });
}

export function useUpcomingMatches() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: matchKeys.upcoming(),
    queryFn: async () => {
      return repositories.match.getUpcoming("club-default");
    },
  });
}

export function usePastMatches() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: matchKeys.past(),
    queryFn: async () => {
      return repositories.match.getPast("club-default");
    },
  });
}

export function useCreateMatch() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      return repositories.match.create("club-default", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all() });
    },
  });
}

export function useUpdateMatch() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateMatchInput;
    }) => {
      return repositories.match.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: matchKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: matchKeys.lists() });
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming() });
      queryClient.invalidateQueries({ queryKey: matchKeys.past() });
    },
  });
}

export function useDeleteMatch() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.match.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.all() });
    },
  });
}
