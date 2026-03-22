import { Button } from '@/components/ui/button';
import type { Extension } from '@/core/hooks/use-extensions';
import { useUpdateExtension } from '@/core/hooks/use-extensions';

interface UpdateButtonProps {
  extension: Extension;
  isPending: boolean;
}

export function UpdateButton({ extension, isPending }: Readonly<UpdateButtonProps>) {
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
