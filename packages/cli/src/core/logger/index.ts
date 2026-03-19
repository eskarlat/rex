import { Logger } from './logger.js';
import { LOGS_DIR } from '../paths/paths.js';

export { Logger } from './logger.js';
export type { LogLevel } from './logger.js';

let globalLogger: Logger | null = null;

/**
 * Get the global Logger instance. Creates one on first call.
 * Writes to ~/.renre-kit/logs/renre-kit-YYYY-MM-DD.log
 */
export function getLogger(): Logger {
  if (!globalLogger) {
    globalLogger = new Logger(LOGS_DIR);
    globalLogger.setConsoleOutput(false);
  }
  return globalLogger;
}
