import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import type { ConfigField } from '@/core/hooks/use-settings';

interface ConfigFormProps {
  schema: Record<string, ConfigField>;
  values: Record<string, unknown>;
  onSave: (values: Record<string, unknown>) => void;
  isSaving: boolean;
}

export function ConfigForm({
  schema,
  values,
  onSave,
  isSaving,
}: ConfigFormProps) {
  const form = useForm<Record<string, unknown>>({
    defaultValues: values,
  });

  useEffect(() => {
    form.reset(values);
  }, [values, form]);

  function onSubmit(data: Record<string, unknown>) {
    onSave(data);
  }

  const fields = Object.entries(schema);

  return (
    <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
      {fields.map(([key, field]) => (
        <div key={key} className="space-y-2">
          <Label htmlFor={`config-${key}`}>{field.label}</Label>
          {field.description && (
            <p className="text-sm text-muted-foreground">
              {field.description}
            </p>
          )}
          <ConfigFieldInput fieldKey={key} field={field} form={form} />
        </div>
      ))}
      <Button type="submit" disabled={isSaving}>
        {isSaving ? 'Saving...' : 'Save'}
      </Button>
    </form>
  );
}

function ConfigFieldInput({
  fieldKey,
  field,
  form,
}: {
  fieldKey: string;
  field: ConfigField;
  form: ReturnType<typeof useForm<Record<string, unknown>>>;
}): React.ReactElement {
  if (field.type === 'boolean') {
    return (
      <div>
        <Switch
          id={`config-${fieldKey}`}
          checked={Boolean(form.watch(fieldKey))}
          onCheckedChange={(checked) => form.setValue(fieldKey, checked)}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <Input
        id={`config-${fieldKey}`}
        type="number"
        {...form.register(fieldKey, { valueAsNumber: true })}
      />
    );
  }

  if (field.type === 'secret') {
    return (
      <Input
        id={`config-${fieldKey}`}
        type="password"
        placeholder="Enter secret value"
        {...form.register(fieldKey)}
      />
    );
  }

  return (
    <Input id={`config-${fieldKey}`} {...form.register(fieldKey)} />
  );
}
