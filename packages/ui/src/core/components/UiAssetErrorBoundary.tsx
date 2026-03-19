import { Component, Suspense, lazy, useMemo, type ReactNode } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { useExtensionSDK } from '@/core/hooks/use-extension-sdk';

interface UiAssetErrorBoundaryProps {
  children: ReactNode;
  fallback: ReactNode;
}

interface UiAssetErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class UiAssetErrorBoundary extends Component<
  UiAssetErrorBoundaryProps,
  UiAssetErrorBoundaryState
> {
  constructor(props: UiAssetErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): UiAssetErrorBoundaryState {
    return { hasError: true, error };
  }

  // eslint-disable-next-line sonarjs/function-return-type -- Error boundary pattern requires conditional render
  render(): ReactNode {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}

function UiAssetError({ label, extensionName }: { label: string; extensionName: string }) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Failed to load {label}</AlertTitle>
      <AlertDescription>
        Could not load the {label} for extension &quot;{extensionName}&quot;.
      </AlertDescription>
    </Alert>
  );
}

function UiAssetSkeleton({ compact }: { compact?: boolean }) {
  if (compact) {
    return (
      <div className="space-y-2 p-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}

interface DynamicUiAssetProps {
  extensionName: string;
  url: string;
  label: string;
  compact?: boolean;
}

export function DynamicUiAsset({ extensionName, url, label, compact }: DynamicUiAssetProps) {
  const { activeProject } = useProjectContext();
  const sdk = useExtensionSDK(extensionName);

  const LazyComponent = useMemo(
    () => lazy(() => import(/* @vite-ignore */ url)),
    [url],
  );

  return (
    <UiAssetErrorBoundary
      fallback={<UiAssetError label={label} extensionName={extensionName} />}
    >
      <Suspense fallback={<UiAssetSkeleton compact={compact} />}>
        <LazyComponent
          sdk={sdk}
          extensionName={extensionName}
          projectPath={activeProject}
        />
      </Suspense>
    </UiAssetErrorBoundary>
  );
}
