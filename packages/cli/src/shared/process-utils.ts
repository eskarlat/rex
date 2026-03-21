import { existsSync, readFileSync } from 'node:fs';

import { getLogger } from '../core/logger/index.js';

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: unknown) {
    // EPERM means the process exists but belongs to another user
    // ESRCH means no such process — expected case
    return err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'EPERM';
  }
}

export function readPidFile(pidPath: string): number | null {
  try {
    if (!existsSync(pidPath)) return null;
    const content = readFileSync(pidPath, 'utf-8').trim();
    const pid = Number(content);
    return Number.isFinite(pid) && pid > 0 ? pid : null;
  } catch (err) {
    getLogger().warn('process', 'Failed to read PID file', {
      pidPath,
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
