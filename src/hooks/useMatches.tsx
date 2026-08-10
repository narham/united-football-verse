/**
 * Match Hooks
 * TanStack Query hooks for match operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type {
  Match,
  MatchListParams,
  CreateMatchInput,
  UpdateMatchInput,
  MatchResult,
  MatchRecordStats,
} from "@/repositories/interfaces";

const matchKeys = {
  all: () => ["matches"],
  lists: () => [...matchKeys.all(), "list"],
  list: (clubId: string, params?: MatchListParams) => [...matchKeys.lists(), clubId, params ?? "default"],
  details: () => [...matchKeys.all(), "detail"],
  detail: (id: string) => [...matchKeys.details(), id],
  upcoming: (clubId: string) => [...matchKeys.all(), "upcoming", clubId],
  past: (clubId: string) => [...matchKeys.all(), "past", clubId],
  result: (id: string) => [...matchKeys.all(), "result", id],
  recordStats: (clubId: string, season?: string) => [...matchKeys.all(), "recordStats", clubId, season ?? "all"],
};

export function useMatches(params?: MatchListParams) {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: matchKeys.list(clubId, params),
    queryFn: async () => {
      const result = await repositories.match.list(clubId, params);
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
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: matchKeys.upcoming(clubId),
    queryFn: async () => {
      return repositories.match.getUpcoming(clubId);
    },
  });
}

export function usePastMatches() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: matchKeys.past(clubId),
    queryFn: async () => {
      return repositories.match.getPast(clubId);
    },
  });
}

export function useMatchResult(matchId: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: matchKeys.result(matchId || ""),
    queryFn: async (): Promise<MatchResult> => {
      if (!matchId) return "upcoming";
      return repositories.match.getResult(matchId);
    },
    enabled: !!matchId,
  });
}

export function useMatchRecordStats(season?: string) {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: matchKeys.recordStats(clubId, season),
    queryFn: async (): Promise<MatchRecordStats> => {
      return repositories.match.getRecordStats(clubId, season);
    },
  });
}

export function useCreateMatch() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMatchInput) => {
      return repositories.match.create(clubId, input);
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
      queryClient.invalidateQueries({ queryKey: matchKeys.upcoming(data.id ? "" : "") });
      queryClient.invalidateQueries({ queryKey: matchKeys.past(data.id ? "" : "") });
      queryClient.invalidateQueries({ queryKey: matchKeys.recordStats(data.id ? "" : "") });
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
