import type { ExtensionLogger } from '../types/context.types.js';

import { getLogger } from './index.js';

export function createExtensionLogger(extensionName: string): ExtensionLogger {
  const source = `ext:${extensionName}`;
  const logger = getLogger();

  return {
    debug(message: string, data?: unknown): void {
      logger.debug(source, message, data);
    },
    info(message: string, data?: unknown): void {
      logger.info(source, message, data);
    },
    warn(message: string, data?: unknown): void {
      logger.warn(source, message, data);
    },
    error(message: string, data?: unknown): void {
      logger.error(source, message, data);
    },
  };
}
