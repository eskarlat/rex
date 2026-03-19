import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
  type UseMutationResult,
} from '@tanstack/react-query';
import { fetchApi } from '@/core/api/client';

/** UI-side widget placement — mirrors server-side DashboardLayout shape */
export interface WidgetPlacement {
  id: string;
  extensionName: string;
  widgetId: string;
  position: { x: number; y: number };
  size: { w: number; h: number };
}

export interface DashboardLayout { widgets: WidgetPlacement[] }

export function useDashboardLayout(): UseQueryResult<DashboardLayout> {
  return useQuery<DashboardLayout>({
    queryKey: ['dashboard-layout'],
    queryFn: () => fetchApi<DashboardLayout>('/api/dashboard/layout'),
  });
}

export function useSaveDashboardLayout(): UseMutationResult<
  void,
  Error,
  DashboardLayout
> {
  const queryClient = useQueryClient();
  return useMutation<void, Error, DashboardLayout>({
    mutationFn: (layout: DashboardLayout) =>
      fetchApi<void>('/api/dashboard/layout', {
        method: 'PUT',
        body: layout,
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['dashboard-layout'] });
    },
  });
}
