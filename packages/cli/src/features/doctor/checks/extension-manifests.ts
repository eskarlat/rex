import { existsSync } from 'node:fs';
import { DB_PATH } from '../../../core/paths/paths.js';
import { getExtensionDir } from '../../../core/paths/paths.js';
import { initDatabase, closeDatabase } from '../../../core/database/database.js';
import { listInstalled } from '../../extensions/manager/extension-manager.js';
import { loadManifest } from '../../extensions/manifest/manifest-loader.js';
import { GLOBAL_DIR } from '../../../core/paths/paths.js';
import type { DiagnosticCheck } from '../types.js';

export const extensionManifestsCheck: DiagnosticCheck = {
  name: 'Extension manifests',
  run: () => {
    if (!existsSync(DB_PATH)) {
      return {
        name: 'Extension manifests',
        status: 'pass',
        message: 'no database (no extensions installed)',
      };
    }
    try {
      const db = initDatabase(GLOBAL_DIR);
      const installed = listInstalled(db);
      closeDatabase();

      if (installed.length === 0) {
        return {
          name: 'Extension manifests',
          status: 'pass',
          message: 'no extensions installed',
        };
      }

      const errors: string[] = [];
      for (const ext of installed) {
        const extDir = getExtensionDir(ext.name, ext.version);
        try {
          loadManifest(extDir);
        } catch (err) {
          errors.push(`${ext.name}@${ext.version}: ${err instanceof Error ? err.message : String(err)}`);
        }
      }

      if (errors.length === 0) {
        return {
          name: 'Extension manifests',
          status: 'pass',
          message: `${installed.length} extension(s) valid`,
        };
      }
      return {
        name: 'Extension manifests',
        status: 'fail',
        message: `${errors.length} manifest error(s)`,
        detail: errors.join('\n'),
      };
    } catch (err) {
      return {
        name: 'Extension manifests',
        status: 'fail',
        message: 'cannot check extensions',
        detail: err instanceof Error ? err.message : String(err),
      };
    }
  },
};
