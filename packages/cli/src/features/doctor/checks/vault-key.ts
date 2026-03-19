import { existsSync, statSync } from 'node:fs';
import path from 'node:path';
import { GLOBAL_DIR } from '../../../core/paths/paths.js';
import type { DiagnosticCheck } from '../types.js';

const KEY_FILE = path.join(GLOBAL_DIR, '.vault-key');

export const vaultKeyCheck: DiagnosticCheck = {
  name: 'Vault key',
  run: () => {
    if (!existsSync(KEY_FILE)) {
      return {
        name: 'Vault key',
        status: 'fail',
        message: 'key file not found',
        detail: `Expected at ${KEY_FILE}. It is created automatically when storing a secret.`,
      };
    }
    try {
      const stat = statSync(KEY_FILE);
      const mode = stat.mode & 0o777;
      if (mode === 0o600) {
        return { name: 'Vault key', status: 'pass', message: 'exists with correct permissions (0o600)' };
      }
      return {
        name: 'Vault key',
        status: 'fail',
        message: `permissions are 0o${mode.toString(8)}, expected 0o600`,
        detail: `Run: chmod 600 ${KEY_FILE}`,
      };
    } catch (err) {
      return {
        name: 'Vault key',
        status: 'fail',
        message: 'cannot stat key file',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
