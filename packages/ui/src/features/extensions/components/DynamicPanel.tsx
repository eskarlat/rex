import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { useExtensionSDK } from '@/core/hooks/use-extension-sdk';

interface DynamicPanelProps {
  extensionName: string;
  panelId?: string;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class PanelErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  // eslint-disable-next-line sonarjs/function-return-type -- Error boundary pattern requires conditional render
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function PanelSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

function PanelError({ extensionName }: { extensionName: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Failed to load panel</AlertTitle>
      <AlertDescription>
        Could not load the UI panel for extension &quot;{extensionName}&quot;.
        The extension may not provide a dashboard panel.
      </AlertDescription>
    </Alert>
  );
}

export function DynamicPanel({ extensionName, panelId }: DynamicPanelProps) {
  const { activeProject } = useProjectContext();
  const sdk = useExtensionSDK(extensionName);
  const panelUrl = panelId
    ? `/api/extensions/${extensionName}/panels/${panelId}.js`
    : `/api/extensions/${extensionName}/panel.js`;

  const LazyPanel = useMemo(
    () => lazy(() => import(/* @vite-ignore */ panelUrl)),
    [panelUrl],
  );

  return (
    <PanelErrorBoundary
      fallback={<PanelError extensionName={extensionName} />}
    >
      <Suspense fallback={<PanelSkeleton />}>
        <LazyPanel
          sdk={sdk}
          extensionName={extensionName}
          projectPath={activeProject}
        />
      </Suspense>
    </PanelErrorBoundary>
  );
}
