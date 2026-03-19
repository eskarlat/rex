import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

export interface Project {
  name: string;
  path: string;
  created_at: string;
}

export function useProjects(): UseQueryResult<Project[]> {
  return useQuery<Project[]>({
    queryKey: ['projects'],
    queryFn: () => fetchApi<Project[]>('/api/projects'),
  });
}

export function useActiveProject(): UseQueryResult<Project | null> {
  return useQuery<Project | null>({
    queryKey: ['project', 'active'],
    queryFn: () => fetchApi<Project | null>('/api/project'),
  });
}

export function useSetActiveProject(): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (projectPath: string) =>
      fetchApi<void>('/api/projects/active', {
        method: 'PUT',
        body: { projectPath },
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['project'] });
      void queryClient.invalidateQueries({ queryKey: ['marketplace'] });
      void queryClient.invalidateQueries({ queryKey: ['extensions'] });
      void queryClient.invalidateQueries({ queryKey: ['vault'] });
      void queryClient.invalidateQueries({ queryKey: ['scheduler'] });
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}
