import * as clack from '@clack/prompts';
import { status } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';

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

  const lines = extensions.map((ext) => {
    const activated = ext.activatedInProject
      ? `  [active v${ext.activatedVersion}]`
      : '  [inactive]';
    return `  ${ext.name}@${ext.version} (${ext.type})${activated}`;
  });

  clack.log.info(`Installed extensions:\n${lines.join('\n')}`);
}
