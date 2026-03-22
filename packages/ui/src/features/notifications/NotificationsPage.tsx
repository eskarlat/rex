import { Bell, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { NotificationItem } from './NotificationItem';
import { useBrowserNotifications } from './use-browser-notifications';
import { useNotificationSocket } from './use-notification-socket';

import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  useNotifications,
  useUnreadCount,
  useMarkRead,
  useMarkAllRead,
  useDeleteNotification,
} from '@/core/hooks/use-notifications';

export function NotificationsPage() {
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
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <h1 className="text-lg font-semibold">Notifications</h1>
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
      <ScrollArea className="flex-1">
        {!notifications || notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-sm text-muted-foreground">
            <Bell className="mb-2 h-10 w-10 opacity-30" />
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
    </div>
  );
}
