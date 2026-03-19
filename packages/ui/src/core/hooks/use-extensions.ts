import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface ExtensionPanel {
  id: string;
  title: string;
}

export interface ExtensionWidget {
  id: string;
  title: string;
  defaultSize: { w: number; h: number };
  minSize?: { w: number; h: number };
  maxSize?: { w: number; h: number };
}

export interface Extension {
  name: string;
  version: string;
  type: 'standard' | 'mcp-stdio' | 'mcp-sse';
  description?: string;
  status: 'active' | 'installed' | 'available';
  author?: string;
  tags?: string[];
  hasConfig?: boolean;
  title?: string;
  panels?: ExtensionPanel[];
  widgets?: ExtensionWidget[];
}

export interface MarketplaceResult {
  active: Extension[];
  installed: Extension[];
  available: Extension[];
}

export function useMarketplace(): UseQueryResult<MarketplaceResult> {
  return useQuery<MarketplaceResult>({
    queryKey: ['marketplace'],
    queryFn: () => fetchApi<MarketplaceResult>('/api/marketplace'),
  });
}

export function useInstallExtension(): UseMutationResult<
  void,
  Error,
  { name: string; version?: string }
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; version?: string }>({
    mutationFn: (data: { name: string; version?: string }) =>
      fetchApi<void>('/api/extensions/install', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useActivateExtension(): UseMutationResult<
  void,
  Error,
  { name: string; version: string }
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; version: string }>({
    mutationFn: (data: { name: string; version: string }) =>
      fetchApi<void>('/api/extensions/activate', {
        method: 'POST',
        body: data,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useDeactivateExtension(): UseMutationResult<
  void,
  Error,
  string
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) =>
      fetchApi<void>('/api/extensions/deactivate', {
        method: 'POST',
        body: { name },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}

export function useRemoveExtension(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) =>
      fetchApi<void>(`/api/extensions/${encodeURIComponent(name)}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
    },
  });
}
