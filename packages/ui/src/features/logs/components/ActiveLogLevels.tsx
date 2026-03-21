import { useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { useSettings } from '@/core/hooks/use-settings';
import { cn } from '@/lib/utils';
import { LEVEL_ICON, LEVEL_VARIANT } from '../constants';

export function ActiveLogLevels() {
  const { data: config } = useSettings();

  const levels = useMemo(() => {
    if (!config) return null;
    const s = config.settings as Partial<{
      logLevels: string[];
      logLevel: string;
    }>;
    return s.logLevels ?? (s.logLevel ? [s.logLevel] : ['info', 'warn', 'error']);
  }, [config]);

  if (!levels) return null;

  return (
    <div className="flex items-center gap-1.5">
      <span className="text-xs text-muted-foreground">Active levels:</span>
      {levels.map((level) => (
        <Badge
          key={level}
          variant="outline"
          className={cn('gap-1 px-1.5 py-0 text-[11px]', LEVEL_VARIANT[level])}
        >
          {LEVEL_ICON[level]}
          {level}
        </Badge>
      ))}
    </div>
  );
}
