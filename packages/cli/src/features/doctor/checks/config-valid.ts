import { existsSync, readFileSync } from 'node:fs';
import { CONFIG_PATH } from '../../../core/paths/paths.js';
import { getSchemaVersion } from '../../../shared/schema-migration.js';
import { configMigrations } from '../../config/migrations/index.js';
import type { DiagnosticCheck } from '../types.js';

const CURRENT_VERSION = configMigrations.length;

export const configValidCheck: DiagnosticCheck = {
  name: 'config.json',
  run: () => {
    if (!existsSync(CONFIG_PATH)) {
      return {
        name: 'config.json',
        status: 'warn',
        message: 'missing (using defaults)',
      };
    }
    try {
      const raw = JSON.parse(readFileSync(CONFIG_PATH, 'utf-8')) as Record<string, unknown>;
      const version = getSchemaVersion(raw);
      if (version > CURRENT_VERSION) {
        return {
          name: 'config.json',
          status: 'fail',
          message: `schemaVersion ${version} is newer than expected (${CURRENT_VERSION})`,
          detail: 'This config was written by a newer CLI version.',
        };
      }
      return {
        name: 'config.json',
        status: 'pass',
        message: `valid, schemaVersion ${version || CURRENT_VERSION}`,
      };
    } catch (err) {
      return {
        name: 'config.json',
        status: 'fail',
        message: 'invalid JSON',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
