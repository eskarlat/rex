import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { fetchApi } from '@/core/api/client';

export interface Registry {
  name: string;
  url: string;
  priority: number;
  last_synced?: string;
}

export function useRegistries(): UseQueryResult<Registry[]> {
  return useQuery<Registry[]>({
    queryKey: ['registries'],
    queryFn: () => fetchApi<Registry[]>('/api/registries'),
  });
}

interface AddRegistryVariables {
  name: string;
  url: string;
  priority?: number;
}

export function useAddRegistry(): UseMutationResult<void, Error, AddRegistryVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, AddRegistryVariables>({
    mutationFn: (data: AddRegistryVariables) =>
      fetchApi<void>('/api/registries', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registries'] });
    },
  });
}

export function useRemoveRegistry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) =>
      fetchApi<void>(`/api/registries/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registries'] });
    },
  });
}

export function useSyncRegistry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) =>
      fetchApi<void>(`/api/registries/${encodeURIComponent(name)}/sync`, {
        method: 'POST',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['registries'] });
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}
