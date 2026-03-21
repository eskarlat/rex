import { Package } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useMarketplace } from '@/core/hooks/use-extensions';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { WidgetGrid } from '@/features/dashboard/components/WidgetGrid';

export function HomePage() {
  const { activeProject } = useProjectContext();
  const { data: marketplace, isLoading } = useMarketplace();

  const activeCount = marketplace?.active?.length ?? 0;

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="truncate text-sm text-muted-foreground md:text-base">
          {activeProject ? `Project: ${activeProject}` : 'No project selected'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:gap-4 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Extensions</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{activeCount}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <WidgetGrid />
    </div>
  );
}
