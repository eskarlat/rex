import fs from 'node:fs';
import path from 'node:path';

const FETCHED_AT_FILE = '.fetched_at';

export function getLastFetched(registryDir: string): Date | null {
  const filePath = path.join(registryDir, FETCHED_AT_FILE);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const content = fs.readFileSync(filePath, 'utf-8').trim();
  const date = new Date(content);
  if (isNaN(date.getTime())) {
    return null;
  }
  return date;
}

export function updateTimestamp(registryDir: string): void {
  const filePath = path.join(registryDir, FETCHED_AT_FILE);
  fs.writeFileSync(filePath, new Date().toISOString());
}

export function isStale(registryDir: string, cacheTTL: number): boolean {
  if (cacheTTL === -1) {
    return false;
  }
  if (cacheTTL === 0) {
    return true;
  }
  const lastFetched = getLastFetched(registryDir);
  if (!lastFetched) {
    return true;
  }
  const ageSeconds = (Date.now() - lastFetched.getTime()) / 1000;
  return ageSeconds > cacheTTL;
}
