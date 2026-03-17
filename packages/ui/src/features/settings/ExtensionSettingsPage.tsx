import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useExtensionSettings,
  useUpdateExtensionSettings,
} from '@/core/hooks/use-settings';
import { ConfigForm } from './components/ConfigForm';

export function ExtensionSettingsPage() {
  const { name } = useParams<{ name: string }>();

  if (!name) {
    return (
      <div className="text-muted-foreground">
        No extension specified.
      </div>
    );
  }

  return <ExtensionSettingsContent name={name} />;
}

function ExtensionSettingsContent({ name }: { name: string }) {
  const { data: config, isLoading } = useExtensionSettings(name);
  const updateSettings = useUpdateExtensionSettings(name);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!config) {
    return (
      <div className="text-muted-foreground">
        No configuration available for this extension.
      </div>
    );
  }

  function handleSave(values: Record<string, unknown>) {
    updateSettings.mutate(values);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <p className="text-muted-foreground">Extension settings</p>
      </div>
      <ConfigForm
        schema={config.schema}
        values={config.values}
        onSave={handleSave}
        isSaving={updateSettings.isPending}
      />
    </div>
  );
}
