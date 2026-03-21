import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { fetchApi } from '@/core/api/client';

export interface VaultEntry {
  key: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export function useVaultEntries(): UseQueryResult<VaultEntry[]> {
  return useQuery<VaultEntry[]>({
    queryKey: ['vault'],
    queryFn: () => fetchApi<VaultEntry[]>('/api/vault'),
  });
}

interface SetVaultEntryVariables {
  key: string;
  value: string;
  secret: boolean;
  tags?: string[];
}

export function useSetVaultEntry(): UseMutationResult<void, Error, SetVaultEntryVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SetVaultEntryVariables>({
    mutationFn: (data: SetVaultEntryVariables) =>
      fetchApi<void>('/api/vault', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

interface UpdateVaultEntryVariables {
  key: string;
  value: string;
  secret: boolean;
  tags?: string[];
}

export function useUpdateVaultEntry(): UseMutationResult<void, Error, UpdateVaultEntryVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, UpdateVaultEntryVariables>({
    mutationFn: (data: UpdateVaultEntryVariables) =>
      fetchApi<void>(`/api/vault/${encodeURIComponent(data.key)}`, {
        method: 'PUT',
        body: { value: data.value, secret: data.secret, tags: data.tags },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}

export function useRemoveVaultEntry(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (key: string) =>
      fetchApi<void>(`/api/vault/${encodeURIComponent(key)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['vault'] });
    },
  });
}
