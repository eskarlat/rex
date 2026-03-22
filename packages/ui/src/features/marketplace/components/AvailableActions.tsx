import { InstallProgressBar, useInstallProgress } from './InstallProgress';

import { Button } from '@/components/ui/button';
import type { Extension } from '@/core/hooks/use-extensions';
import { useActivateExtension } from '@/core/hooks/use-extensions';

interface AvailableActionsProps {
  extension: Extension;
}

export function AvailableActions({ extension }: Readonly<AvailableActionsProps>) {
  const { state, startInstall } = useInstallProgress();
  const activate = useActivateExtension();

  const isInstalling = state.step !== 'idle' && state.step !== 'error' && state.step !== 'done';

  if (isInstalling) {
    return <InstallProgressBar state={state} />;
  }

  if (state.step === 'done') {
    return (
      <Button
        size="sm"
        onClick={() => activate.mutate({ name: extension.name, version: extension.version })}
      >
        Activate
      </Button>
    );
  }

  if (state.step === 'error') {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-destructive">Install failed</span>
        <Button size="sm" variant="outline" onClick={() => void startInstall(extension.name)}>
          Retry
        </Button>
      </div>
    );
  }

  return (
    <Button size="sm" onClick={() => void startInstall(extension.name)}>
      Install
    </Button>
  );
}
