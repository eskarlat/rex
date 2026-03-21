import * as React from 'react';

import { cn } from '@/lib/utils';

function Skeleton({ className, ref, ...props }: React.ComponentProps<'div'>) {
  return <div ref={ref} className={cn('animate-pulse rounded-md bg-primary/10', className)} {...props} />;
}

export { Skeleton };
