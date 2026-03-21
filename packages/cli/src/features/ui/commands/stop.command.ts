import { existsSync, unlinkSync } from 'node:fs';

import * as clack from '@clack/prompts';

import { SERVER_PID_PATH } from '../../../core/paths/paths.js';
import { isProcessRunning, readPidFile } from '../../../shared/process-utils.js';
import { getLogger } from '../../../core/logger/index.js';

export function handleStop(): void {
  clack.intro('Stop RenreKit Dashboard');

  const pid = readPidFile(SERVER_PID_PATH);
  if (pid === null) {
    clack.log.warn('No running dashboard server found.');
    clack.outro('Nothing to stop.');
    return;
  }

  if (!isProcessRunning(pid)) {
    clack.log.warn(`Server process ${pid} is not running. Cleaning up stale PID file.`);
    try {
      unlinkSync(SERVER_PID_PATH);
    } catch (err) {
      getLogger().warn('ui', 'Failed to remove stale PID file', {
        path: SERVER_PID_PATH,
        error: err instanceof Error ? err.message : String(err),
      });
    }
    clack.outro('Nothing to stop.');
    return;
  }

  try {
    // process.kill(pid) sends SIGTERM on POSIX and uses TerminateProcess on Windows
    process.kill(pid);
    clack.log.success(`Dashboard server stopped (PID ${pid}).`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to stop server: ${message}`);
  }

  try {
    if (existsSync(SERVER_PID_PATH)) {
      unlinkSync(SERVER_PID_PATH);
    }
  } catch (err) {
    getLogger().warn('ui', 'Failed to clean up PID file after stop', {
      path: SERVER_PID_PATH,
      error: err instanceof Error ? err.message : String(err),
    });
  }

  clack.outro('Done.');
}
