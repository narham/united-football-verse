/**
 * Season Hooks
 * TanStack Query hooks for season operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type { Season, CreateSeasonInput, UpdateSeasonInput } from "@/repositories/interfaces";

const seasonKeys = {
  all: () => ["seasons"],
  lists: () => [...seasonKeys.all(), "list"],
  list: () => [...seasonKeys.lists()],
  details: () => [...seasonKeys.all(), "detail"],
  detail: (id: string) => [...seasonKeys.details(), id],
  active: () => [...seasonKeys.all(), "active"],
};

export function useSeasons() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: seasonKeys.list(),
    queryFn: async () => {
      return repositories.season.list("club-default");
    },
  });
}

export function useActiveSeason() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: seasonKeys.active(),
    queryFn: async () => {
      return repositories.season.getActive("club-default");
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
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSeasonInput) => {
      return repositories.season.create("club-default", input);
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
      queryClient.invalidateQueries({ queryKey: seasonKeys.active() });
    },
  });
}
