import { Bell, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { useBrowserNotifications } from './use-browser-notifications';
import { useNotificationSocket } from './use-notification-socket';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/core/hooks/use-notifications';
import type { NotificationRecord } from '@/core/hooks/use-notifications';

const VARIANT_COLORS: Record<string, string> = {
  info: 'bg-blue-500',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

function formatRelativeTime(iso: string): string {
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

function NotificationItem({
  notification,
  onRead,
  onDelete,
}: Readonly<{
  notification: NotificationRecord;
  onRead: (id: number, actionUrl: string | null) => void;
  onDelete: (id: number) => void;
}>) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer',
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
          'mt-1.5 h-2 w-2 rounded-full flex-shrink-0',
          VARIANT_COLORS[notification.variant] ?? VARIANT_COLORS['info'],
        )}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight">{notification.title}</p>
        {notification.message && (
          <p className="text-xs text-muted-foreground mt-0.5 truncate">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatRelativeTime(notification.created_at)}
        </p>
      </div>
      <button
        type="button"
        className="p-0.5 text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
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

export function NotificationCenter() {
  const navigate = useNavigate();
  const { data: notifications } = useNotifications({ limit: 50 });
  const { data: countData } = useUnreadCount();
  const markRead = useMarkRead();
  const markAllRead = useMarkAllRead();
  const deleteNotification = useDeleteNotification();

  useNotificationSocket();
  useBrowserNotifications();

  const unreadCount = countData?.unread ?? 0;

  const handleRead = (id: number, actionUrl: string | null) => {
    markRead.mutate(id);
    if (actionUrl) {
      Promise.resolve(navigate(actionUrl)).catch(() => {});
    }
  };

  const handleDelete = (id: number) => {
    deleteNotification.mutate(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-2 py-1 text-xs"
              onClick={() => markAllRead.mutate()}
            >
              <Check className="mr-1 h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>
        <ScrollArea className="max-h-80">
          {(!notifications || notifications.length === 0) ? (
            <div className="flex flex-col items-center justify-center py-8 text-sm text-muted-foreground">
              <Bell className="mb-2 h-8 w-8 opacity-30" />
              No notifications
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={handleRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
