import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { useSettings, useUpdateSettings, type GlobalConfig } from '@/core/hooks/use-settings';

const LOG_LEVELS = ['debug', 'info', 'warn', 'error'] as const;
type LogLevel = (typeof LOG_LEVELS)[number];

interface SettingsForm {
  logLevels: LogLevel[];
}

export function GeneralPage() {
  const { data: config, isLoading } = useSettings();
  const updateSettings = useUpdateSettings();
  const { setTheme, theme: currentTheme } = useTheme();

  const form = useForm<SettingsForm>({
    defaultValues: {
      logLevels: ['info', 'warn', 'error'],
    },
  });

  useEffect(() => {
    if (config) {
      const s = config.settings as Partial<{
        logLevels: LogLevel[];
        logLevel: LogLevel;
      }>;
      const logLevels = s.logLevels ?? (s.logLevel ? [s.logLevel] : ['info', 'warn', 'error']);
      form.reset({ logLevels });
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

  function toggleLogLevel(level: LogLevel) {
    const current = form.getValues('logLevels');
    const next = current.includes(level) ? current.filter((l) => l !== level) : [...current, level];
    form.setValue('logLevels', next);
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const selectedLevels = form.watch('logLevels');

  return (
    <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="theme">Theme</Label>
        <Select value={currentTheme} onValueChange={setTheme}>
          <SelectTrigger id="theme">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="light">Light</SelectItem>
            <SelectItem value="dark">Dark</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        <Label>Log Level</Label>
        <div className="flex flex-col gap-2">
          {LOG_LEVELS.map((level) => (
            <label key={level} className="flex items-center gap-2 cursor-pointer">
              <Checkbox
                checked={selectedLevels.includes(level)}
                onCheckedChange={() => toggleLogLevel(level)}
              />
              <span className="text-sm capitalize">{level}</span>
            </label>
          ))}
        </div>
      </div>

      <Button type="submit" disabled={updateSettings.isPending}>
        {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
      </Button>
    </form>
  );
}
