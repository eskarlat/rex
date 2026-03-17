import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface ScheduledTask {
  id: number;
  name: string;
  extension_name: string;
  command: string;
  cron: string;
  enabled: boolean;
  last_run?: string;
  next_run?: string;
  created_at: string;
}

export interface TaskHistoryEntry {
  id: number;
  task_id: number;
  started_at: string;
  finished_at: string;
  duration_ms: number;
  status: 'success' | 'failure';
  output?: string;
  error?: string;
}

export function useScheduledTasks(): UseQueryResult<ScheduledTask[]> {
  return useQuery<ScheduledTask[]>({
    queryKey: ['scheduler'],
    queryFn: () => fetchApi<ScheduledTask[]>('/api/scheduler'),
  });
}

interface CreateTaskVariables {
  name: string;
  extension_name: string;
  command: string;
  cron: string;
}

export function useCreateTask(): UseMutationResult<
  void,
  Error,
  CreateTaskVariables
> {
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
  id: number;
  enabled?: boolean;
  cron?: string;
}

export function useUpdateTask(): UseMutationResult<
  void,
  Error,
  UpdateTaskVariables
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateTaskVariables>({
    mutationFn: (data: UpdateTaskVariables) =>
      fetchApi<void>(`/api/scheduler/${String(data.id)}`, {
        method: 'PUT',
        body: { enabled: data.enabled, cron: data.cron },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useDeleteTask(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id: number) =>
      fetchApi<void>(`/api/scheduler/${String(id)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useTriggerTask(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id: number) =>
      fetchApi<void>(`/api/scheduler/${String(id)}/trigger`, {
        method: 'POST',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
    },
  });
}

export function useTaskHistory(id: number): UseQueryResult<TaskHistoryEntry[]> {
  return useQuery<TaskHistoryEntry[]>({
    queryKey: ['scheduler', id, 'history'],
    queryFn: () =>
      fetchApi<TaskHistoryEntry[]>(`/api/scheduler/${String(id)}/history`),
    enabled: id > 0,
  });
}
