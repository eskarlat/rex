import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface ScheduledTask {
  id: string;
  name: string;
  type: string;
  project_path: string | null;
  command: string;
  cron: string;
  enabled: number;
  last_run_at: string | null;
  last_status: string | null;
  next_run_at: string | null;
  created_at: string;
}

export interface TaskHistoryEntry {
  id: number;
  task_id: string;
  started_at: string;
  finished_at: string | null;
  duration_ms: number | null;
  status: string;
  output?: string;
}

export function useScheduledTasks(): UseQueryResult<ScheduledTask[]> {
  return useQuery<ScheduledTask[]>({
    queryKey: ['scheduler'],
    queryFn: () => fetchApi<ScheduledTask[]>('/api/scheduler'),
  });
}

interface CreateTaskVariables {
  extension_name: string;
  command: string;
  cron: string;
}

export function useCreateTask(): UseMutationResult<void, Error, CreateTaskVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, CreateTaskVariables>({
    mutationFn: (data: CreateTaskVariables) =>
      fetchApi<void>('/api/scheduler', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

interface UpdateTaskVariables {
  id: string;
  enabled?: number;
  cron?: string;
}

export function useUpdateTask(): UseMutationResult<void, Error, UpdateTaskVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateTaskVariables>({
    mutationFn: (data: UpdateTaskVariables) =>
      fetchApi<void>(`/api/scheduler/${data.id}`, {
        method: 'PUT',
        body: { enabled: data.enabled, cron: data.cron },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useDeleteTask(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) =>
      fetchApi<void>(`/api/scheduler/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useTriggerTask(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (id: string) =>
      fetchApi<void>(`/api/scheduler/${id}/trigger`, {
        method: 'POST',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useTaskHistory(id: string): UseQueryResult<TaskHistoryEntry[]> {
  return useQuery<TaskHistoryEntry[]>({
    queryKey: ['scheduler', id, 'history'],
    queryFn: () => fetchApi<TaskHistoryEntry[]>(`/api/scheduler/${id}/history`),
    enabled: !!id,
  });
}
