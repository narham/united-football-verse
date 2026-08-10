/**
 * Finance Hooks
 * TanStack Query hooks for transaction operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
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
  list: (params?: TransactionListParams) => [...financeKeys.lists(), params ?? "default"],
  details: () => [...financeKeys.all(), "detail"],
  detail: (id: string) => [...financeKeys.details(), id],
  totals: () => [...financeKeys.all(), "totals"],
  balance: () => [...financeKeys.all(), "balance"],
};

export function useTransactions(params?: TransactionListParams) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: financeKeys.list(params),
    queryFn: async () => {
      const result = await repositories.finance.list("club-default", params);
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

  return useQuery({
    queryKey: financeKeys.totals(),
    queryFn: async () => {
      return repositories.finance.getTotals("club-default");
    },
  });
}

export function useFinanceBalance() {
  const repositories = useRepositories();

  return useQuery({
    queryKey: financeKeys.balance(),
    queryFn: async () => {
      return repositories.finance.getBalance("club-default");
    },
  });
}

export function useCreateTransaction() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTransactionInput) => {
      return repositories.finance.create("club-default", input);
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
      queryClient.invalidateQueries({ queryKey: financeKeys.totals() });
      queryClient.invalidateQueries({ queryKey: financeKeys.balance() });
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
      queryClient.invalidateQueries({ queryKey: financeKeys.totals() });
      queryClient.invalidateQueries({ queryKey: financeKeys.balance() });
    },
  });
}
