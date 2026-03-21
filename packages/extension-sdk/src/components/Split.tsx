import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface SplitProps {
  left: ReactNode;
  right: ReactNode;
  className?: string;
  ratio?: string;
}

export function Split({ left, right, className, ratio = '1fr 1fr' }: Readonly<SplitProps>) {
  return (
    <div className={cn('grid gap-4', className)} style={{ gridTemplateColumns: ratio }}>
      <div>{left}</div>
      <div>{right}</div>
    </div>
  );
}
