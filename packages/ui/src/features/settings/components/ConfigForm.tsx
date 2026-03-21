import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyRound } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useVaultEntries } from '@/core/hooks/use-vault';
import type { ConfigField, ConfigMapping } from '@/core/hooks/use-settings';

const VAULT_PREFIX = '{{VAULT:';
const VAULT_SUFFIX = '}}';

function isVaultRef(value: unknown): boolean {
  return (
    typeof value === 'string' && value.startsWith(VAULT_PREFIX) && value.endsWith(VAULT_SUFFIX)
  );
}

function extractVaultKey(value: string): string {
  return value.slice(VAULT_PREFIX.length, -VAULT_SUFFIX.length);
}

function makeVaultRef(key: string): string {
  return `${VAULT_PREFIX}${key}${VAULT_SUFFIX}`;
}

export interface ConfigFormResult {
  fieldName: string;
  mapping: ConfigMapping;
}

interface ConfigFormProps {
  schema: Record<string, ConfigField>;
  values: Record<string, unknown>;
  onSave: (results: ConfigFormResult[]) => void;
  isSaving: boolean;
}

export function ConfigForm({ schema, values, onSave, isSaving }: Readonly<ConfigFormProps>) {
  const form = useForm<Record<string, unknown>>({ defaultValues: values });

  useEffect(() => {
    form.reset(values);
  }, [values, form]);

  function onSubmit(data: Record<string, unknown>) {
    const results: ConfigFormResult[] = [];
    for (const [fieldName, value] of Object.entries(data)) {
      const strValue = typeof value === 'string' ? value : JSON.stringify(value ?? '');
      if (isVaultRef(strValue)) {
        results.push({ fieldName, mapping: { source: 'vault', value: extractVaultKey(strValue) } });
      } else {
        results.push({ fieldName, mapping: { source: 'direct', value: strValue } });
      }
    }
    onSave(results);
  }

  const fields = Object.entries(schema);

  if (fields.length === 0) {
    return <p className="text-muted-foreground">No configuration fields defined.</p>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(form.getValues());
      }}
      className="space-y-6"
    >
      {fields.map(([key, field]) => (
        <div key={key} className="space-y-1">
          <Label htmlFor={`config-${key}`} className="capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </Label>
          {field.description && (
            <p className="text-xs text-muted-foreground">{field.description}</p>
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
}: Readonly<{
  fieldKey: string;
  field: ConfigField;
  form: ReturnType<typeof useForm<Record<string, unknown>>>;
}>): React.ReactElement {
  const [vaultOpen, setVaultOpen] = useState(false);
  const currentValue = form.watch(fieldKey);
  const isVault = isVaultRef(currentValue);

  if (field.type === 'boolean') {
    return (
      <div>
        <Switch
          id={`config-${fieldKey}`}
          checked={Boolean(currentValue)}
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

  return (
    <div className="flex gap-1">
      <Input
        id={`config-${fieldKey}`}
        type={field.secret && !isVault ? 'password' : 'text'}
        placeholder={field.vaultHint ? `Vault hint: ${field.vaultHint}` : undefined}
        className={isVault ? 'font-mono text-xs bg-muted' : ''}
        readOnly={isVault}
        {...form.register(fieldKey)}
      />
      <Button
        type="button"
        variant={isVault ? 'default' : 'outline'}
        size="icon"
        className="shrink-0"
        title={isVault ? 'Using vault value' : 'Select from vault'}
        onClick={() => setVaultOpen(true)}
      >
        <KeyRound className="h-4 w-4" />
      </Button>
      {isVault && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => form.setValue(fieldKey, '')}
        >
          Clear
        </Button>
      )}
      <VaultPickerDialog
        open={vaultOpen}
        onClose={() => setVaultOpen(false)}
        onSelect={(key) => {
          form.setValue(fieldKey, makeVaultRef(key));
          setVaultOpen(false);
        }}
        hint={field.vaultHint}
      />
    </div>
  );
}

function VaultPickerDialog({
  open,
  onClose,
  onSelect,
  hint,
}: Readonly<{
  open: boolean;
  onClose: () => void;
  onSelect: (key: string) => void;
  hint?: string;
}>) {
  const { data: entries } = useVaultEntries();
  const [search, setSearch] = useState('');

  const filtered = (entries ?? []).filter((e) =>
    e.key.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select Vault Key</DialogTitle>
        </DialogHeader>
        <Input
          placeholder="Search vault keys..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
        {hint && (
          <p className="text-xs text-muted-foreground">
            Suggested:{' '}
            <button type="button" className="font-mono underline" onClick={() => onSelect(hint)}>
              {hint}
            </button>
          </p>
        )}
        <div className="max-h-60 overflow-y-auto space-y-1">
          {filtered.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {entries?.length === 0
                ? 'No vault entries. Add one in Settings > Vault.'
                : 'No matches.'}
            </p>
          ) : (
            filtered.map((entry) => (
              <button
                key={entry.key}
                type="button"
                className="w-full rounded-md px-3 py-2 text-left text-sm hover:bg-muted flex items-center justify-between"
                onClick={() => onSelect(entry.key)}
              >
                <span className="font-mono">{entry.key}</span>
                <span className="text-xs text-muted-foreground">
                  {entry.created_at?.slice(0, 10) ?? ''}
                </span>
              </button>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
