/**
 * Finance Hooks
 * TanStack Query hooks for transaction operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories, useCurrentOrganizationId } from "./useRepositories";
import type {
  Transaction,
  TransactionListParams,
  CreateTransactionInput,
  UpdateTransactionInput,
  FinanceTotals,
} from "@/repositories/interfaces";

const financeKeys = {
  all: () => ["transactions"],
  lists: () => [...financeKeys.all(), "list"],
  list: (clubId: string, params?: TransactionListParams) => [...financeKeys.lists(), clubId, params ?? "default"],
  details: () => [...financeKeys.all(), "detail"],
  detail: (id: string) => [...financeKeys.details(), id],
  totals: (clubId: string) => [...financeKeys.all(), "totals", clubId],
  balance: (clubId: string) => [...financeKeys.all(), "balance", clubId],
};

export function useTransactions(params?: TransactionListParams) {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: financeKeys.list(clubId, params),
    queryFn: async () => {
      const result = await repositories.finance.list(clubId, params);
      return result.data || [];
    },
  });
}

export function useTransaction(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: financeKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.finance.getById(id);
    },
    enabled: !!id,
  });
}

export function useFinanceTotals() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: financeKeys.totals(clubId),
    queryFn: async (): Promise<FinanceTotals> => {
      return repositories.finance.getTotals(clubId);
    },
  });
}

export function useFinanceBalance() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();

  return useQuery({
    queryKey: financeKeys.balance(clubId),
    queryFn: async () => {
      return repositories.finance.getBalance(clubId);
    },
  });
}

export function useCreateTransaction() {
  const repositories = useRepositories();
  const clubId = useCurrentOrganizationId();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      return repositories.finance.create(clubId, input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all() });
    },
  });
}

export function useUpdateTransaction() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTransactionInput;
    }) => {
      return repositories.finance.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: financeKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: financeKeys.lists() });
      queryClient.invalidateQueries({ queryKey: financeKeys.totals(data.id ? "" : "") });
      queryClient.invalidateQueries({ queryKey: financeKeys.balance(data.id ? "" : "") });
    },
  });
}

export function useDeleteTransaction() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.finance.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: financeKeys.all() });
    },
  });
}
