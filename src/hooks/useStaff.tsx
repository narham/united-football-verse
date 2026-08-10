/**
 * Staff Hooks
 * TanStack Query hooks for staff operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type {
  Staff,
  StaffListParams,
  CreateStaffInput,
  UpdateStaffInput,
} from "@/repositories/interfaces";

const staffKeys = {
  all: () => ["staff"],
  lists: () => [...staffKeys.all(), "list"],
  list: (clubId: string, params?: StaffListParams) => [...staffKeys.lists(), clubId, params ?? "default"],
  details: () => [...staffKeys.all(), "detail"],
  detail: (id: string) => [...staffKeys.details(), id],
};

export function useStaff(params?: StaffListParams) {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: staffKeys.list(clubId, params),
    queryFn: async () => {
      const result = await repositories.staff.list(clubId, params);
      return result.data || [];
    },
  });
}

export function useStaffMember(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: staffKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.staff.getById(id);
    },
    enabled: !!id,
  });
}

export function useCreateStaff() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateStaffInput) => {
      return repositories.staff.create(clubId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all() });
    },
  });
}

export function useUpdateStaff() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateStaffInput;
    }) => {
      return repositories.staff.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: staffKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: staffKeys.lists() });
    },
  });
}

export function useDeleteStaff() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.staff.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staffKeys.all() });
    },
  });
}
