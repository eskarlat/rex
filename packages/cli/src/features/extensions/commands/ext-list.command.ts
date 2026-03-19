import * as clack from '@clack/prompts';
import { status } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';
import { readUpdateCache } from '../update-cache/update-cache.js';

interface ExtListOptions {
  projectPath: string;
}

export function handleExtList(options: ExtListOptions): void {
  const db = getDb();
  const extensions = status(options.projectPath, db);

  if (extensions.length === 0) {
    clack.log.info('No extensions installed.');
    return;
  }

  const cache = readUpdateCache();

  const lines = extensions.map((ext) => {
    const activated = ext.activatedInProject
      ? `  [active v${ext.activatedVersion}]`
      : '  [inactive]';

    let badge = '';
    if (cache) {
      const update = cache.updates.find((u) => u.name === ext.name);
      if (update) {
        badge = update.engineCompatible
          ? `  (-> ${update.availableVersion} available)`
          : `  (-> ${update.availableVersion} incompatible engine)`;
      }
    }

    return `  ${ext.name}@${ext.version} (${ext.type})${activated}${badge}`;
  });

  clack.log.info(`Installed extensions:\n${lines.join('\n')}`);
}
