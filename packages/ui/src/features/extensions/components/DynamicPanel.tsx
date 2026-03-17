import { Component, Suspense, lazy, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface DynamicPanelProps {
  extensionName: string;
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

export function DynamicPanel({ extensionName }: DynamicPanelProps) {
  const panelUrl = `/api/extensions/${extensionName}/panel.js`;
  const LazyPanel = lazy(
    () => import(/* @vite-ignore */ panelUrl)
  );

  return (
    <PanelErrorBoundary
      fallback={<PanelError extensionName={extensionName} />}
    >
      <Suspense fallback={<PanelSkeleton />}>
        <LazyPanel />
      </Suspense>
    </PanelErrorBoundary>
  );
}
