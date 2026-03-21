import type { ReactNode } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';

export interface ResourcePageProps {
  title: string;
  description: string;
  isLoading: boolean;
  dialogOpen: boolean;
  onDialogOpenChange: (open: boolean) => void;
  dialogTitle: string;
  dialogDescription: string;
  triggerLabel: string;
  submitLabel: string;
  submitPendingLabel: string;
  submitDisabled: boolean;
  isPending: boolean;
  onSubmit: () => void;
  formContent: ReactNode;
  children: ReactNode;
}

export function ResourcePage({
  title,
  description,
  isLoading,
  dialogOpen,
  onDialogOpenChange,
  dialogTitle,
  dialogDescription,
  triggerLabel,
  submitLabel,
  submitPendingLabel,
  submitDisabled,
  isPending,
  onSubmit,
  formContent,
  children,
}: Readonly<ResourcePageProps>) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={onDialogOpenChange}>
          <DialogTrigger asChild>
            <Button>{triggerLabel}</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{dialogTitle}</DialogTitle>
              <DialogDescription>{dialogDescription}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4">{formContent}</div>
            <DialogFooter>
              <Button onClick={onSubmit} disabled={submitDisabled}>
                {isPending ? submitPendingLabel : submitLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      {children}
    </div>
  );
}
