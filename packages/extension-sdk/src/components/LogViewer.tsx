import { cn } from '@/lib/utils';

export interface LogViewerProps {
  lines: string[];
  className?: string;
  maxHeight?: string;
}

export function LogViewer({ lines, className, maxHeight = '400px' }: LogViewerProps) {
  return (
    <div
      className={cn('overflow-auto rounded-md border bg-muted p-4 font-mono text-sm', className)}
      style={{ maxHeight }}
    >
      {lines.map((line, index) => (
        // eslint-disable-next-line sonarjs/no-array-index-key -- log lines are plain strings with no natural key
        <div key={index}>{line}</div>
      ))}
    </div>
  );
}
