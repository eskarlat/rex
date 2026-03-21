import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Extension } from '@/core/hooks/use-extensions';
import {
  useInstallExtension,
  useActivateExtension,
  useDeactivateExtension,
  useRemoveExtension,
  useUpdateExtension,
} from '@/core/hooks/use-extensions';

interface ExtensionActionsProps {
  extension: Extension;
}

function UpdateButton({ extension, isPending }: { extension: Extension; isPending: boolean }) {
  const update = useUpdateExtension();

  if (!extension.updateAvailable) return null;

  if (extension.engineCompatible === false) {
    return (
      <Button
        size="sm"
        variant="outline"
        disabled={isPending || update.isPending}
        onClick={() => update.mutate({ name: extension.name, force: true })}
      >
        Force Update
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      disabled={isPending || update.isPending}
      onClick={() => update.mutate({ name: extension.name })}
    >
      Update
    </Button>
  );
}

export function UpdateBadge({ extension }: ExtensionActionsProps) {
  if (!extension.updateAvailable) return null;

  if (extension.engineCompatible === false) {
    return (
      <Badge variant="destructive" className="text-xs">
        {extension.updateAvailable} (incompatible)
      </Badge>
    );
  }

  return <Badge className="text-xs bg-blue-600">{extension.updateAvailable} available</Badge>;
}

export function ExtensionActions({ extension }: ExtensionActionsProps) {
  const install = useInstallExtension();
  const activate = useActivateExtension();
  const deactivate = useDeactivateExtension();
  const remove = useRemoveExtension();

  const isPending =
    install.isPending || activate.isPending || deactivate.isPending || remove.isPending;

  if (extension.status === 'available') {
    return (
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => install.mutate({ name: extension.name })}
      >
        Install
      </Button>
    );
  }

  if (extension.status === 'installed') {
    return (
      <div className="flex flex-wrap gap-2">
        <UpdateButton extension={extension} isPending={isPending} />
        <Button
          size="sm"
          disabled={isPending}
          onClick={() =>
            activate.mutate({
              name: extension.name,
              version: extension.version,
            })
          }
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

  if (extension.status === 'active') {
    return (
      <div className="flex flex-wrap gap-2">
        <UpdateButton extension={extension} isPending={isPending} />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => deactivate.mutate(extension.name)}
        >
          Deactivate
        </Button>
      </div>
    );
  }

  return null;
}
