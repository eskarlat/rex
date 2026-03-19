import { useToast } from '@/core/hooks/use-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts, dismiss } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="alert"
          className={cn(
            'rounded-md border p-4 shadow-lg animate-in slide-in-from-bottom-2 fade-in',
            toast.variant === 'destructive'
              ? 'border-destructive bg-destructive text-destructive-foreground'
              : 'border-border bg-background',
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">{toast.title}</p>
              {toast.description && (
                <p className="mt-1 text-xs text-muted-foreground">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground text-xs"
            >
              x
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
