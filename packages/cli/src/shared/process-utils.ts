import { existsSync, readFileSync } from 'node:fs';

export function isProcessRunning(pid: number): boolean {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

export function readPidFile(pidPath: string): number | null {
  if (!existsSync(pidPath)) return null;
  const content = readFileSync(pidPath, 'utf-8').trim();
  const pid = Number(content);
  return Number.isFinite(pid) && pid > 0 ? pid : null;
}
