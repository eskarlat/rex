import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface RegistryConfig {
  name: string;
  url: string;
  priority: number;
  cacheTTL: number;
}

export interface ConfigMapping {
  source: 'vault' | 'direct';
  value: string;
}

export interface GlobalConfig {
  registries: RegistryConfig[];
  settings: Record<string, unknown>;
  extensionConfigs: Record<string, Record<string, ConfigMapping>>;
}

export interface ConfigField {
  type: 'string' | 'number' | 'boolean';
  description?: string;
  secret?: boolean;
  vaultHint?: string;
  default?: unknown;
}

export function useSettings(): UseQueryResult<GlobalConfig> {
  return useQuery<GlobalConfig>({
    queryKey: ['settings'],
    queryFn: () => fetchApi<GlobalConfig>('/api/settings'),
  });
}

export function useUpdateSettings(): UseMutationResult<void, Error, GlobalConfig> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, GlobalConfig>({
    mutationFn: (data: GlobalConfig) =>
      fetchApi<void>('/api/settings', {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export interface SetExtensionConfigVariables {
  fieldName: string;
  mapping: ConfigMapping;
}

export function useExtensionSettings(name: string): UseQueryResult<Record<string, unknown>> {
  return useQuery<Record<string, unknown>>({
    queryKey: ['settings', 'extensions', name],
    queryFn: () =>
      fetchApi<Record<string, unknown>>(`/api/settings/extensions/${encodeURIComponent(name)}`),
    enabled: !!name,
  });
}

export function useUpdateExtensionSettings(
  name: string,
): UseMutationResult<void, Error, SetExtensionConfigVariables> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, SetExtensionConfigVariables>({
    mutationFn: (data: SetExtensionConfigVariables) =>
      fetchApi<void>(`/api/settings/extensions/${encodeURIComponent(name)}`, {
        method: 'PUT',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: ['settings', 'extensions', name],
      });
    },
  });
}
