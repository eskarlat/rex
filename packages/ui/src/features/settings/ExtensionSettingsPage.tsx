import { useParams } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useExtensionSettings,
  useUpdateExtensionSettings,
  type ConfigMapping,
} from '@/core/hooks/use-settings';
import { ConfigForm } from './components/ConfigForm';
import type { ConfigField } from '@/core/hooks/use-settings';

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

  const schema = (config as Record<string, unknown>).schema as
    | Record<string, ConfigField>
    | undefined;
  const values = (config as Record<string, unknown>).values as
    | Record<string, unknown>
    | undefined;

  function handleSave(formValues: Record<string, unknown>) {
    for (const [fieldName, value] of Object.entries(formValues)) {
      const mapping: ConfigMapping = {
        source: 'direct',
        value: String(value),
      };
      updateSettings.mutate({ fieldName, mapping });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{name}</h1>
        <p className="text-muted-foreground">Extension settings</p>
      </div>
      <ConfigForm
        schema={schema ?? {}}
        values={values ?? config as Record<string, unknown>}
        onSave={handleSave}
        isSaving={updateSettings.isPending}
      />
    </div>
  );
}
