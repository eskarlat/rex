import { existsSync, unlinkSync } from 'node:fs';
import * as clack from '@clack/prompts';
import { SERVER_PID_PATH } from '../../../core/paths/paths.js';
import { isProcessRunning, readPidFile } from '../../../shared/process-utils.js';

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
    } catch {
      // PID file may have been removed by another process
    }
    clack.outro('Nothing to stop.');
    return;
  }

  try {
    // On Windows, SIGTERM is not supported; process.kill uses TerminateProcess
    if (process.platform === 'win32') {
      process.kill(pid);
    } else {
      process.kill(pid, 'SIGTERM');
    }
    clack.log.success(`Dashboard server stopped (PID ${pid}).`);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    clack.log.error(`Failed to stop server: ${message}`);
  }

  try {
    if (existsSync(SERVER_PID_PATH)) {
      unlinkSync(SERVER_PID_PATH);
    }
  } catch {
    // PID file may have been removed between check and unlink
  }

  clack.outro('Done.');
}
