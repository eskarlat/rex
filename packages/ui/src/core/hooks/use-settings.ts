import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface Settings {
  port: number;
  theme: 'light' | 'dark';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface ExtensionConfig {
  schema: Record<string, ConfigField>;
  values: Record<string, unknown>;
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean' | 'secret';
  label: string;
  description?: string;
  default?: unknown;
  required?: boolean;
}

export function useSettings(): UseQueryResult<Settings> {
  return useQuery<Settings>({
    queryKey: ['settings'],
    queryFn: () => fetchApi<Settings>('/api/settings'),
  });
}

export function useUpdateSettings(): UseMutationResult<
  void,
  Error,
  Partial<Settings>
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Partial<Settings>>({
    mutationFn: (data: Partial<Settings>) =>
      fetchApi<void>('/api/settings', {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function useExtensionSettings(
  name: string
): UseQueryResult<ExtensionConfig> {
  return useQuery<ExtensionConfig>({
    queryKey: ['settings', 'extensions', name],
    queryFn: () =>
      fetchApi<ExtensionConfig>(
        `/api/settings/extensions/${encodeURIComponent(name)}`
      ),
    enabled: !!name,
  });
}

export function useUpdateExtensionSettings(
  name: string
): UseMutationResult<void, Error, Record<string, unknown>> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, Record<string, unknown>>({
    mutationFn: (data: Record<string, unknown>) =>
      fetchApi<void>(
        `/api/settings/extensions/${encodeURIComponent(name)}`,
        {
          method: 'PUT',
          body: data,
        }
      ),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['settings', 'extensions', name],
      });
    },
  });
}
