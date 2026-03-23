import { useProjectContext } from '@/core/providers/ProjectProvider';
import { WidgetGrid } from '@/features/dashboard/components/WidgetGrid';

export function HomePage() {
  const { activeProject } = useProjectContext();

  return (
    <div className="space-y-4 md:space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
        <p className="truncate text-sm text-muted-foreground md:text-base">
          {activeProject ? `Project: ${activeProject}` : 'No project selected'}
        </p>
      </div>

      <WidgetGrid />
    </div>
  );
}
