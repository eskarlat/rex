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
  type Settings,
} from '@/core/hooks/use-settings';

export function GeneralPage() {
  const { data: settings, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();

  const form = useForm<Settings>({
    defaultValues: {
      port: 4200,
      theme: 'light',
      logLevel: 'info',
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset(settings);
    }
  }, [settings, form]);

  function onSubmit(data: Settings) {
    updateSettings.mutate(data);
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
            form.setValue('theme', value as Settings['theme'])
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
            form.setValue('logLevel', value as Settings['logLevel'])
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
