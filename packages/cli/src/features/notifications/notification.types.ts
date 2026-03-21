export type NotificationVariant = 'info' | 'success' | 'warning' | 'error';

export interface NotificationRecord {
  id: number;
  extension_name: string;
  title: string;
  message: string;
  variant: NotificationVariant;
  action_url: string | null;
  read: number;
  created_at: string;
}

export interface CreateNotificationPayload {
  extension_name: string;
  title: string;
  message: string;
  variant?: NotificationVariant;
  action_url?: string;
}
