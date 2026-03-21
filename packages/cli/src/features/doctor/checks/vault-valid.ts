import { existsSync, readFileSync } from 'node:fs';

import { VAULT_PATH } from '../../../core/paths/paths.js';
import { getSchemaVersion } from '../../../shared/schema-migration.js';
import { vaultMigrations } from '../../vault/migrations/index.js';
import type { DiagnosticCheck } from '../types.js';

const SUPPORTED_VERSION = Math.max(...vaultMigrations.map((m) => m.toVersion), 0);

export const vaultValidCheck: DiagnosticCheck = {
  name: 'vault.json',
  run: () => {
    if (!existsSync(VAULT_PATH)) {
      return {
        name: 'vault.json',
        status: 'warn',
        message: 'missing (no secrets stored)',
      };
    }
    try {
      const raw = JSON.parse(readFileSync(VAULT_PATH, 'utf-8')) as Record<string, unknown>;
      const version = getSchemaVersion(raw);
      if (version > SUPPORTED_VERSION) {
        return {
          name: 'vault.json',
          status: 'fail',
          message: `schemaVersion ${version} is newer than supported (${SUPPORTED_VERSION})`,
          detail: 'This vault was written by a newer CLI version.',
        };
      }
      return {
        name: 'vault.json',
        status: 'pass',
        message: `valid, schemaVersion ${version}`,
      };
    } catch (err) {
      return {
        name: 'vault.json',
        status: 'fail',
        message: 'invalid JSON',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
