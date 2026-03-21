import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';

import { fetchApi } from '@/core/api/client';
import { showToast } from '@/core/hooks/use-toast';

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
  updateAvailable?: string | null;
  engineCompatible?: boolean;
  hasIcon?: boolean;
  installedAt?: string;
  registrySource?: string;
  installPath?: string;
  gitUrl?: string;
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

export function useExtensionDoc(
  name: string | undefined,
  docType: 'readme' | 'changelog',
): UseQueryResult<string | null> {
  return useQuery<string | null>({
    queryKey: [`extension-${docType}`, name],
    queryFn: async () => {
      const result = await fetchApi<Record<string, string>>(
        `/api/extensions/${encodeURIComponent(name!)}/${docType}`,
      );
      return result[docType] ?? null;
    },
    enabled: !!name,
  });
}

export function useExtensionChangelog(
  name: string | undefined,
): UseQueryResult<string | null> {
  return useExtensionDoc(name, 'changelog');
}

export function useExtensionReadme(
  name: string | undefined,
): UseQueryResult<string | null> {
  return useExtensionDoc(name, 'readme');
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      showToast({ title: `Installed ${variables.name}` });
    },
    onError: (error, variables) => {
      showToast({
        title: `Failed to install ${variables.name}`,
        description: error.message,
        variant: 'destructive',
      });
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
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      showToast({ title: `Activated ${variables.name}` });
    },
    onError: (error, variables) => {
      showToast({
        title: `Failed to activate ${variables.name}`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useDeactivateExtension(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (name: string) =>
      fetchApi<void>('/api/extensions/deactivate', {
        method: 'POST',
        body: { name },
      }),
    onSuccess: (_data, name) => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      showToast({ title: `Deactivated ${name}` });
    },
    onError: (error, name) => {
      showToast({
        title: `Failed to deactivate ${name}`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}

export function useUpdateExtension(): UseMutationResult<
  void,
  Error,
  { name: string; force?: boolean }
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, { name: string; force?: boolean }>({
    mutationFn: (data: { name: string; force?: boolean }) =>
      fetchApi<void>('/api/extensions/update', {
        method: 'POST',
        body: data,
      }),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      showToast({ title: `Updated ${variables.name}` });
    },
    onError: (error, variables) => {
      showToast({
        title: `Failed to update ${variables.name}`,
        description: error.message,
        variant: 'destructive',
      });
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
    onSuccess: (_data, name) => {
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      showToast({ title: `Uninstalled ${name}` });
    },
    onError: (error, name) => {
      showToast({
        title: `Failed to uninstall ${name}`,
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
