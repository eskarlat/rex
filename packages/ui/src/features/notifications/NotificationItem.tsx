import { X } from 'lucide-react';

import { cn } from '@/lib/utils';
import type { NotificationRecord } from '@/core/hooks/use-notifications';

const VARIANT_COLORS: Record<string, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

interface NotificationItemProps {
  notification: NotificationRecord;
  onRead: (id: number, actionUrl: string | null) => void;
  onDelete: (id: number) => void;
}

export function NotificationItem({
  notification,
  onRead,
  onDelete,
}: Readonly<NotificationItemProps>) {
  return (
    <div
      className={cn(
        'flex cursor-pointer items-start gap-3 px-3 py-2 transition-colors hover:bg-muted/50',
        notification.read === 0 && 'bg-muted/30',
      )}
      onClick={() => onRead(notification.id, notification.action_url)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onRead(notification.id, notification.action_url);
        }
      }}
    >
      <span
        className={cn(
          'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
          VARIANT_COLORS[notification.variant] ?? VARIANT_COLORS['info'],
        )}
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{notification.title}</p>
        {notification.message && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {notification.message}
          </p>
        )}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      <button
        type="button"
        className="flex-shrink-0 p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(notification.id);
        }}
        aria-label="Delete notification"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
