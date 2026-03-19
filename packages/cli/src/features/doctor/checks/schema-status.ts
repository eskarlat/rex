import { existsSync, readdirSync } from 'node:fs';
import BetterSqlite3 from 'better-sqlite3';
import { DB_PATH } from '../../../core/paths/paths.js';
import { findMigrationsDir } from '../../../core/database/database.js';
import type { DiagnosticCheck } from '../types.js';

export const schemaStatusCheck: DiagnosticCheck = {
  name: 'Schema status',
  run: () => {
    if (!existsSync(DB_PATH)) {
      return {
        name: 'Schema status',
        status: 'fail',
        message: 'database not found',
        detail: 'Cannot check migrations without a database.',
      };
    }
    try {
      const db = new BetterSqlite3(DB_PATH, { readonly: true });
      const migrationsDir = findMigrationsDir();
      const files = readdirSync(migrationsDir)
        .filter((f) => f.endsWith('.sql'))
        .sort((a, b) => a.localeCompare(b));

      const applied = new Set(
        (db.prepare('SELECT name FROM _migrations').all() as Array<{ name: string }>).map(
          (r) => r.name,
        ),
      );
      db.close();

      const pending = files.filter((f) => !applied.has(f));
      if (pending.length === 0) {
        return {
          name: 'Schema status',
          status: 'pass',
          message: `up-to-date (${applied.size} migrations applied)`,
        };
      }
      return {
        name: 'Schema status',
        status: 'warn',
        message: `${pending.length} pending migration(s)`,
        detail: `Pending: ${pending.join(', ')}`,
      };
    } catch (err) {
      return {
        name: 'Schema status',
        status: 'fail',
        message: 'cannot read migration state',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
