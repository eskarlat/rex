import { existsSync, readFileSync } from 'node:fs';

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch (err: unknown) {
    // EPERM means the process exists but belongs to another user
    if (err instanceof Error && 'code' in err && (err as NodeJS.ErrnoException).code === 'EPERM') {
      return true;
    }
    // ESRCH means no such process — expected case
    return false;
  }
}

export function readPidFile(pidPath: string): number | null {
  if (!existsSync(pidPath)) return null;
  const content = readFileSync(pidPath, 'utf-8').trim();
  const pid = Number(content);
  return Number.isFinite(pid) && pid > 0 ? pid : null;
}
