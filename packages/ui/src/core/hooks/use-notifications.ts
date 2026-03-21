import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface NotificationRecord {
  id: number;
  extension_name: string;
  title: string;
  message: string;
  variant: 'info' | 'success' | 'warning' | 'error';
  action_url: string | null;
  read: number;
  created_at: string;
}

export interface UnreadCountResult {
  unread: number;
}

interface ListOptions {
  unreadOnly?: boolean;
  limit?: number;
}

export function useNotifications(options?: ListOptions): UseQueryResult<NotificationRecord[]> {
  const params = new URLSearchParams();
  if (options?.unreadOnly) params.set('unreadOnly', 'true');
  if (options?.limit) params.set('limit', String(options.limit));
  const qs = params.toString();
  const url = qs ? `/api/notifications?${qs}` : '/api/notifications';

  return useQuery<NotificationRecord[]>({
    queryKey: ['notifications', options],
    queryFn: () => fetchApi<NotificationRecord[]>(url),
  });
}

export function useUnreadCount(): UseQueryResult<UnreadCountResult> {
  return useQuery<UnreadCountResult>({
    queryKey: ['notifications', 'count'],
    queryFn: () => fetchApi<UnreadCountResult>('/api/notifications/count'),
  });
}

export function useMarkRead(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id: number) =>
      fetchApi<void>(`/api/notifications/${id}/read`, { method: 'PATCH' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useMarkAllRead(): UseMutationResult<void, Error, void> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, void>({
    mutationFn: () =>
      fetchApi<void>('/api/notifications/read-all', { method: 'PATCH' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}

export function useDeleteNotification(): UseMutationResult<void, Error, number> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, number>({
    mutationFn: (id: number) =>
      fetchApi<void>(`/api/notifications/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
}
