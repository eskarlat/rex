import fs from 'node:fs';
import path from 'node:path';
import * as clack from '@clack/prompts';
import type Database from 'better-sqlite3';
import { EXTENSIONS_DIR } from '../../../core/paths/paths.js';
import { getActivated } from '../manager/extension-manager.js';
import { removeDirSync } from '../../../shared/fs-helpers.js';
import type { ProjectRecord } from '../../../core/types/index.js';

interface ExtCleanupOptions {
  db: Database.Database;
}

function getAllReferencedVersions(db: Database.Database): Set<string> {
  const referenced = new Set<string>();

  const projects = db.prepare('SELECT * FROM projects').all() as ProjectRecord[];
  for (const project of projects) {
    const plugins = getActivated(project.path);
    for (const [name, version] of Object.entries(plugins)) {
      referenced.add(`${name}@${version}`);
    }
  }

  return referenced;
}

export function handleExtCleanup(options: ExtCleanupOptions): void {
  if (!fs.existsSync(EXTENSIONS_DIR)) {
    clack.log.info('No unused extension versions to clean up.');
    return;
  }

  const referenced = getAllReferencedVersions(options.db);
  const dirs = fs.readdirSync(EXTENSIONS_DIR, 'utf-8');
  const toRemove: string[] = [];

  for (const dir of dirs) {
    if (!referenced.has(dir)) {
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
