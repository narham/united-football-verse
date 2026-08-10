/**
 * Training Hooks
 * TanStack Query hooks for training session and attendance operations
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRepositories } from "./useRepositories";
import type {
  TrainingSession,
  TrainingListParams,
  CreateTrainingInput,
  UpdateTrainingInput,
  Attendance,
  RecordAttendanceInput,
} from "@/repositories/interfaces";

const trainingKeys = {
  all: () => ["training"],
  lists: () => [...trainingKeys.all(), "list"],
  list: (params?: TrainingListParams) => [...trainingKeys.lists(), params ?? "default"],
  details: () => [...trainingKeys.all(), "detail"],
  detail: (id: string) => [...trainingKeys.details(), id],
  attendance: () => [...trainingKeys.all(), "attendance"],
  attendanceBySession: (sessionId: string) => [...trainingKeys.attendance(), sessionId],
};

export function useTrainingSessions(params?: TrainingListParams) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: trainingKeys.list(params),
    queryFn: async () => {
      const result = await repositories.training.list("club-default", params);
      return result.data || [];
    },
  });
}

export function useTrainingSession(id: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: trainingKeys.detail(id || ""),
    queryFn: async () => {
      if (!id) return null;
      return repositories.training.getById(id);
    },
    enabled: !!id,
  });
}

export function useAttendance(trainingId: string | undefined) {
  const repositories = useRepositories();

  return useQuery({
    queryKey: trainingKeys.attendanceBySession(trainingId || ""),
    queryFn: async () => {
      if (!trainingId) return [];
      return repositories.training.getAttendance(trainingId);
    },
    enabled: !!trainingId,
  });
}

export function useCreateTrainingSession() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateTrainingInput) => {
      return repositories.training.create("club-default", input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all() });
    },
  });
}

export function useUpdateTrainingSession() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTrainingInput;
    }) => {
      return repositories.training.update(id, data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: trainingKeys.lists() });
    },
  });
}

export function useDeleteTrainingSession() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      return repositories.training.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: trainingKeys.all() });
    },
  });
}

export function useRecordAttendance() {
  const repositories = useRepositories();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: RecordAttendanceInput) => {
      return repositories.training.recordAttendance(input);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: trainingKeys.attendanceBySession(data.trainingId),
      });
    },
  });
}
