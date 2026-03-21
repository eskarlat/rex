import { writeFileSync, unlinkSync } from 'node:fs';

import { initDatabase, GLOBAL_DIR, LAN_PIN_PATH, getLogger, loadGlobalConfig } from '@renre-kit/cli/lib';
import type { LogLevel } from '@renre-kit/cli/lib';

import { createServer } from './server.js';
import { SchedulerRunner } from './features/scheduler/scheduler-runner.js';
import { preventSleep } from './core/utils/sleep-prevention.js';
import { installConsoleCapture } from './core/utils/console-capture.js';
import { generatePin } from './core/utils/pin-generator.js';

export const SERVER_VERSION = '0.0.1';
export { createServer } from './server.js';

const DEFAULT_PORT = 4200;

async function main(): Promise<void> {
  // Capture console output for the server console log stream
  installConsoleCapture();

  // Initialize the database
  initDatabase(GLOBAL_DIR);

  const port = Number(process.env['PORT'] ?? DEFAULT_PORT);
  const lanMode = process.env['LAN_MODE'] === 'true';

  // Generate and persist LAN PIN so the CLI can display it
  let lanPin: string | undefined;
  if (lanMode) {
    lanPin = generatePin();
    writeFileSync(LAN_PIN_PATH, lanPin, 'utf-8');
  }

  const server = await createServer({ lanMode, lanPin });

  // Start scheduler
  const scheduler = new SchedulerRunner();
  scheduler.initializeNextRuns();
  scheduler.start();

  // Prevent system sleep while dashboard is active
  const sleepLock = preventSleep();

  // Graceful shutdown
  const shutdown = async (): Promise<void> => {
    scheduler.stop();
    sleepLock.release();
    if (lanMode) {
      try {
        unlinkSync(LAN_PIN_PATH);
      } catch {
        /* already removed */
      }
    }
    await server.close();
    process.exit(0);
  };

  process.on('SIGINT', () => void shutdown());
  process.on('SIGTERM', () => void shutdown());

  const host = lanMode ? '0.0.0.0' : '127.0.0.1';
  await server.listen({ port, host });

  const log = getLogger();
  const { settings } = loadGlobalConfig();
  const savedLevel = settings.logLevel;
  if (typeof savedLevel === 'string' && ['debug', 'info', 'warn', 'error'].includes(savedLevel)) {
    log.setLevel(savedLevel as LogLevel);
  }
  log.info('server', `Dashboard v${SERVER_VERSION} started`, { host, port, lanMode });
}

void main();
