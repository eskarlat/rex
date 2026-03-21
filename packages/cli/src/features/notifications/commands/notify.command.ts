import * as clack from '@clack/prompts';
import { createNotification } from '../notification-manager.js';
import { getDb } from '../../../core/database/database.js';
import type { NotificationVariant } from '../notification.types.js';

const VALID_VARIANTS: NotificationVariant[] = ['info', 'success', 'warning', 'error'];

export interface NotifyOptions {
  title: string;
  message: string;
  variant: string;
  source: string;
  actionUrl?: string;
}

export function handleNotify(options: NotifyOptions): void {
  if (!VALID_VARIANTS.includes(options.variant as NotificationVariant)) {
    clack.log.error(
      `Invalid variant: "${options.variant}". Must be one of: ${VALID_VARIANTS.join(', ')}`,
    );
    return;
  }

  const db = getDb();
  const notification = createNotification(db, {
    extension_name: options.source,
    title: options.title,
    message: options.message,
    variant: options.variant as NotificationVariant,
    action_url: options.actionUrl,
  });

  clack.log.success(`Notification created (id: ${notification.id})`);
}
