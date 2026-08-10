/**
 * Season Hooks
 * TanStack Query hooks for season operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type { Season, CreateSeasonInput, UpdateSeasonInput } from "@/repositories/interfaces";

const seasonKeys = {
  all: () => ["seasons"],
  lists: () => [...seasonKeys.all(), "list"],
  list: (clubId: string) => [...seasonKeys.lists(), clubId],
  details: () => [...seasonKeys.all(), "detail"],
  detail: (id: string) => [...seasonKeys.details(), id],
  active: (clubId: string) => [...seasonKeys.all(), "active", clubId],
};

export function useSeasons() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: seasonKeys.list(clubId),
    queryFn: async () => {
      return repositories.season.list(clubId);
    },
  });
}

export function useActiveSeason() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: seasonKeys.active(clubId),
    queryFn: async () => {
      return repositories.season.getActive(clubId);
    },
  });
}

export function useSeason(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: seasonKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.season.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateSeason() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSeasonInput) => {
      return repositories.season.create(clubId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all() });
    },
  });
}

export function useUpdateSeason() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateSeasonInput;
    }) => {
      return repositories.season.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: seasonKeys.lists() });
    },
  });
}

export function useDeleteSeason() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.season.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all() });
    },
  });
}

export function useSetActiveSeason() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.season.setActive(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: seasonKeys.all() });
    },
  });
}
