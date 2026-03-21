import { existsSync } from 'node:fs';

import BetterSqlite3 from 'better-sqlite3';

import { DB_PATH } from '../../../core/paths/paths.js';
import type { DiagnosticCheck } from '../types.js';

export const databaseCheck: DiagnosticCheck = {
  name: 'Database',
  run: () => {
    if (!existsSync(DB_PATH)) {
      return {
        name: 'Database',
        status: 'fail',
        message: 'db.sqlite not found',
        detail: `Expected at ${DB_PATH}. Run "renre-kit init" to create it.`,
      };
    }
    try {
      const db = new BetterSqlite3(DB_PATH, { readonly: true });
      db.close();
      return { name: 'Database', status: 'pass', message: 'opens successfully' };
    } catch (err) {
      return {
        name: 'Database',
        status: 'fail',
        message: 'cannot open database',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
