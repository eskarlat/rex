import type { ReactNode } from 'react';

import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export interface PanelProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Panel({ title, description, children, className }: Readonly<PanelProps>) {
  return (
    <Card className={cn(className)}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}
