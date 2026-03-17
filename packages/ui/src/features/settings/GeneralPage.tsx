import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useSettings,
  useUpdateSettings,
  type GlobalConfig,
} from '@/core/hooks/use-settings';

interface SettingsForm {
  port: number;
  theme: 'light' | 'dark';
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function GeneralPage() {
  const { data: config, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<SettingsForm>({
    defaultValues: {
      port: 4200,
      theme: 'light',
      logLevel: 'info',
    },
  });

  useEffect(() => {
    if (config) {
      const s = config.settings as Partial<SettingsForm>;
      form.reset({
        port: s.port ?? 4200,
        theme: s.theme ?? 'light',
        logLevel: s.logLevel ?? 'info',
      });
    }
  }, [config, form]);

  function onSubmit(data: SettingsForm) {
    if (!config) return;
    const updated: GlobalConfig = {
      ...config,
      settings: { ...config.settings, ...data },
    };
    updateSettings.mutate(updated);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="port">Port</Label>
        <Input
          id="port"
          type="number"
          {...form.register('port', { valueAsNumber: true })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select
          value={form.watch('theme')}
          onValueChange={(value) =>
            form.setValue('theme', value as SettingsForm['theme'])
          }
        >
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="logLevel">Log Level</Label>
        <Select
          value={form.watch('logLevel')}
          onValueChange={(value) =>
            form.setValue('logLevel', value as SettingsForm['logLevel'])
          }
        >
          <SelectTrigger id="logLevel">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
