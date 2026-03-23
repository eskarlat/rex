import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { NotificationItem } from './NotificationItem';
import { useBrowserNotifications } from './use-browser-notifications';
import { useNotificationSocket } from './use-notification-socket';

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
import { useIsMobile } from '@/hooks/use-mobile';

export function NotificationCenter() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
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

  const triggerButton = (
    <button
      type="button"
      className="relative inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      aria-label="Notifications"
      onClick={isMobile ? () => { void navigate('/notifications'); } : undefined}
    >
      <Bell className="h-4 w-4" />
      {unreadCount > 0 && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );

  if (isMobile) {
    return triggerButton;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{triggerButton}</DropdownMenuTrigger>
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
        <ScrollArea className="max-h-[min(320px,60svh)]">
          {!notifications || notifications.length === 0 ? (
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
