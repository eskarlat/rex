import { rmSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

export default function globalTeardown(): void {
  try {
    const e2eHome = readFileSync(join(__dirname, '..', '.e2e-home'), 'utf-8').trim();
    rmSync(e2eHome, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  try {
    rmSync(join(__dirname, '..', '.e2e-home'), { force: true });
  } catch {
    // Ignore cleanup errors
  }
}
