import { UpdateButton } from './UpdateButton';

import { Button } from '@/components/ui/button';
import type { Extension } from '@/core/hooks/use-extensions';
import { useActivateExtension, useRemoveExtension } from '@/core/hooks/use-extensions';

interface InstalledActionsProps {
  extension: Extension;
}

export function InstalledActions({ extension }: Readonly<InstalledActionsProps>) {
  const activate = useActivateExtension();
  const remove = useRemoveExtension();

  const isPending = activate.isPending || remove.isPending;

  return (
    <div className="flex flex-wrap gap-2">
      <UpdateButton extension={extension} isPending={isPending} />
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => activate.mutate({ name: extension.name, version: extension.version })}
      >
        Activate
      </Button>
      <Button
        size="sm"
        variant="destructive"
        disabled={isPending}
        onClick={() => remove.mutate(extension.name)}
      >
        Uninstall
      </Button>
    </div>
  );
}
