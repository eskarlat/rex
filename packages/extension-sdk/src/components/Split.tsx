import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

export interface SplitProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  ratio?: string;
}

export function Split({ left, right, className, ratio = '1fr 1fr' }: SplitProps) {
  return (
    <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: ratio }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
