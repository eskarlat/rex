import { cn } from '@/lib/utils';

export interface LogViewerProps {
  lines: string[];
  className?: string;
  maxHeight?: string;
}

export function LogViewer({ lines, className, maxHeight = '400px' }: Readonly<LogViewerProps>) {
  return (
    <div
      className={cn('overflow-auto rounded-md border bg-muted p-4 font-mono text-sm', className)}
      style={{ maxHeight }}
    >
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  );
}
