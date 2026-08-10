/**
 * Player Hooks
 * TanStack Query hooks for player operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type {
  Player,
  PlayerListParams,
  CreatePlayerInput,
  UpdatePlayerInput,
} from "@/repositories/interfaces";

// Query key constants
const playerKeys = {
  all: () => ["players"],
  lists: () => [...playerKeys.all(), "list"],
  list: (params?: PlayerListParams) => [
    ...playerKeys.lists(),
    params,
  ],
  details: () => [...playerKeys.all(), "detail"],
  detail: (id: string) => [...playerKeys.details(), id],
};

/**
 * Fetch all players with optional filters
 */
export function usePlayers(params?: PlayerListParams) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: playerKeys.list(params),
    queryFn: async () => {
      return repositories.player.list(params);
    },
  });
}

/**
 * Fetch single player by ID
 */
export function usePlayer(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: playerKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.player.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Create player mutation
 */
export function useCreatePlayer() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreatePlayerInput) => {
      return repositories.player.create("club-default", input);
    },
    onSuccess: () => {
      // Invalidate all player queries
      queryClient.invalidateQueries({ queryKey: playerKeys.all() });
    },
  });
}

/**
 * Update player mutation
 */
export function useUpdatePlayer() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdatePlayerInput;
    }) => {
      return repositories.player.update(id, data);
    },
    onSuccess: (data) => {
      // Invalidate player queries
      queryClient.invalidateQueries({ queryKey: playerKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: playerKeys.lists() });
    },
  });
}

/**
 * Delete player mutation
 */
export function useDeletePlayer() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.player.delete(id);
    },
    onSuccess: () => {
      // Invalidate all player queries
      queryClient.invalidateQueries({ queryKey: playerKeys.all() });
    },
  });
}
