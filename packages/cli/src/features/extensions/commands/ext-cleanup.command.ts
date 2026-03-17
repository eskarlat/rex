import fs from 'node:fs';
import path from 'node:path';
import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';
import { EXTENSIONS_DIR } from '../../../core/paths/paths.js';
import { listInstalled } from '../manager/extension-manager.js';
import { removeDirSync } from '../../../shared/fs-helpers.js';

interface ExtCleanupOptions {
  db: Database.Database;
}

export function handleExtCleanup(options: ExtCleanupOptions): void {
  if (!fs.existsSync(EXTENSIONS_DIR)) {
    clack.log.info('No unused extension versions to clean up.');
    return;
  }

  const installed = listInstalled(options.db);
  const activeVersions = new Set(
    installed.map((ext) => `${ext.name}@${ext.version}`),
  );

  const dirs = fs.readdirSync(EXTENSIONS_DIR, 'utf-8');
  const toRemove: string[] = [];

  for (const dir of dirs) {
    if (!activeVersions.has(dir)) {
      toRemove.push(dir);
    }
  }

  if (toRemove.length === 0) {
    clack.log.info('No unused extension versions to clean up.');
    return;
  }

  for (const dir of toRemove) {
    removeDirSync(path.join(EXTENSIONS_DIR, dir));
  }

  clack.log.success(`Cleaned up ${toRemove.length} unused extension version(s).`);
}
