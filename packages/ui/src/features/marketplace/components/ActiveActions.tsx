import { UpdateButton } from './UpdateButton';

import { Button } from '@/components/ui/button';
import type { Extension } from '@/core/hooks/use-extensions';
import { useDeactivateExtension } from '@/core/hooks/use-extensions';

interface ActiveActionsProps {
  extension: Extension;
}

export function ActiveActions({ extension }: Readonly<ActiveActionsProps>) {
  const deactivate = useDeactivateExtension();

  return (
    <div className="flex flex-wrap gap-2">
      <UpdateButton extension={extension} isPending={deactivate.isPending} />
      <Button
        size="sm"
        variant="outline"
        disabled={deactivate.isPending}
        onClick={() => deactivate.mutate(extension.name)}
      >
        Deactivate
      </Button>
    </div>
  );
}
