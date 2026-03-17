import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { Extension } from '@/core/hooks/use-extensions';
import {
  useInstallExtension,
  useActivateExtension,
  useDeactivateExtension,
  useRemoveExtension,
} from '@/core/hooks/use-extensions';

interface ExtensionCardProps {
  extension: Extension;
}

export function ExtensionCard({ extension }: ExtensionCardProps) {
  const install = useInstallExtension();
  const activate = useActivateExtension();
  const deactivate = useDeactivateExtension();
  const remove = useRemoveExtension();

  const isPending =
    install.isPending ||
    activate.isPending ||
    deactivate.isPending ||
    remove.isPending;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-base">{extension.name}</CardTitle>
          <div className="flex gap-1">
            <Badge variant="outline">{extension.version}</Badge>
            <Badge variant="secondary">{extension.type}</Badge>
          </div>
        </div>
        <CardDescription>
          {extension.description ?? 'No description available.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {extension.author && (
          <p className="text-sm text-muted-foreground">
            By {extension.author}
          </p>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        {extension.status === 'available' && (
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => install.mutate({ name: extension.name })}
          >
            Install
          </Button>
        )}
        {extension.status === 'installed' && (
          <>
            <Button
              size="sm"
              disabled={isPending}
              onClick={() => activate.mutate(extension.name)}
            >
              Activate
            </Button>
            <Button
              size="sm"
              variant="destructive"
              disabled={isPending}
              onClick={() => remove.mutate(extension.name)}
            >
              Remove
            </Button>
          </>
        )}
        {extension.status === 'active' && (
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => deactivate.mutate(extension.name)}
          >
            Deactivate
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
