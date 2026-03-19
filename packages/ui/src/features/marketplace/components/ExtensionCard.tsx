import { Puzzle } from 'lucide-react';
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
  useUpdateExtension,
} from '@/core/hooks/use-extensions';

interface ExtensionCardProps {
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

function CardActions({ extension }: ExtensionCardProps) {
  const install = useInstallExtension();
  const activate = useActivateExtension();
  const deactivate = useDeactivateExtension();
  const remove = useRemoveExtension();

  const isPending =
    install.isPending ||
    activate.isPending ||
    deactivate.isPending ||
    remove.isPending;

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
      <>
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
      </>
    );
  }

  if (extension.status === 'active') {
    return (
      <>
        <UpdateButton extension={extension} isPending={isPending} />
        <Button
          size="sm"
          variant="outline"
          disabled={isPending}
          onClick={() => deactivate.mutate(extension.name)}
        >
          Deactivate
        </Button>
      </>
    );
  }

  return null;
}

function UpdateBadge({ extension }: ExtensionCardProps) {
  if (!extension.updateAvailable) return null;

  if (extension.engineCompatible === false) {
    return (
      <Badge variant="destructive" className="text-xs">
        {extension.updateAvailable} (incompatible)
      </Badge>
    );
  }

  return (
    <Badge className="text-xs bg-blue-600">
      {extension.updateAvailable} available
    </Badge>
  );
}

function ExtensionIcon({ extension }: ExtensionCardProps) {
  if (!extension.hasIcon) {
    return (
      <div className="flex h-8 w-8 items-center justify-center rounded bg-muted" data-testid="default-icon">
        <Puzzle className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }

  return (
    <img
      src={`/api/extensions/${encodeURIComponent(extension.name)}/icon`}
      alt={`${extension.name} icon`}
      className="h-8 w-8 rounded object-contain"
    />
  );
}

export function ExtensionCard({ extension }: ExtensionCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ExtensionIcon extension={extension} />
            <CardTitle className="text-base">{extension.name}</CardTitle>
          </div>
          <div className="flex gap-1">
            <Badge variant="outline">{extension.version}</Badge>
            <Badge variant="secondary">{extension.type}</Badge>
          </div>
        </div>
        <UpdateBadge extension={extension} />
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
        {extension.tags && extension.tags.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {extension.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="gap-2">
        <CardActions extension={extension} />
      </CardFooter>
    </Card>
  );
}
