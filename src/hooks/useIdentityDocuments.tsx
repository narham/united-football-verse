/**
 * Identity Document Query Hooks
 * 
 * TanStack Query hooks for identity document CRUD operations.
 * Follows the standard hook pattern with proper query invalidation.
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type {
  IdentityDocument,
  CreateIdentityDocumentInput,
  UpdateIdentityDocumentInput,
} from "@/repositories/interfaces";

// ============================================================================
// Query Keys (DO NOT CHANGE THIS PATTERN)
// ============================================================================

const identityDocumentKeys = {
  all: () => ["identity-documents"] as const,
  lists: () => [...identityDocumentKeys.all(), "list"] as const,
  list: (playerId?: string) => [...identityDocumentKeys.lists(), playerId ?? "default"] as const,
  details: () => [...identityDocumentKeys.all(), "detail"] as const,
  detail: (id: string) => [...identityDocumentKeys.details(), id] as const,
  playerDocuments: (playerId: string) => [...identityDocumentKeys.all(), "player", playerId] as const,
};

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all identity documents for a specific player
 */
export function useIdentityDocuments(playerId: string | undefined) {
  const repositories = useRepositories();
  return useQuery({
    queryKey: identityDocumentKeys.playerDocuments(playerId ?? ""),
    queryFn: async () => {
      if (!playerId) return [];
      return repositories.identityDocument.getByPlayerId(playerId);
    },
    enabled: !!playerId,
  });
}

/**
 * Fetch a single identity document
 */
export function useIdentityDocument(id: string | undefined) {
  const repositories = useRepositories();
  return useQuery({
    queryKey: identityDocumentKeys.detail(id ?? ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.identityDocument.getById(id);
    },
    enabled: !!id,
  });
}

/**
 * Check if a document number is already registered (for duplicate detection)
 */
export function useCheckIdentityDocument(
  documentType?: string,
  documentNumber?: string,
  issuingCountry?: string
) {
  const repositories = useRepositories();
  return useQuery({
    queryKey: ["identity-check", documentType, documentNumber, issuingCountry],
    queryFn: async () => {
      if (!documentType || !documentNumber) return null;
      return repositories.identityDocument.findByDocumentNumber(
        documentType as any,
        documentNumber,
        issuingCountry
      );
    },
    enabled: !!documentType && !!documentNumber,
  });
}

// ============================================================================
// Mutations
// ============================================================================

export function useCreateIdentityDocument() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateIdentityDocumentInput) => {
      return repositories.identityDocument.create("club-default", data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.playerDocuments(data.playerId) });
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.all() });
    },
  });
}

export function useUpdateIdentityDocument() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: UpdateIdentityDocumentInput }) => {
      return repositories.identityDocument.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.playerDocuments(data.playerId) });
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.all() });
    },
  });
}

export function useDeleteIdentityDocument() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // Get document first to know which player it belongs to
      const doc = await repositories.identityDocument.getById(id);
      if (!doc) throw new Error("Dokumen tidak ditemukan");
      
      await repositories.identityDocument.delete(id);
      return doc;
    },
    onSuccess: (deletedDoc) => {
      queryClient.invalidateQueries({
        queryKey: identityDocumentKeys.playerDocuments(deletedDoc.playerId),
      });
      queryClient.invalidateQueries({ queryKey: identityDocumentKeys.all() });
    },
  });
}
