import * as clack from '@clack/prompts';
import path from 'node:path';
import { ProjectManager } from '../../../core/project/project-manager.js';
import { EventBus } from '../../../core/event-bus/event-bus.js';
import { getDb } from '../../../core/database/database.js';
import { listInstalled, activate } from '../../extensions/manager/extension-manager.js';
import { getExtensionDir } from '../../../core/paths/paths.js';

interface InitOptions {
  projectPath: string;
  force: boolean;
}

export async function handleInit(options: InitOptions): Promise<void> {
  clack.intro('Initialize RenreKit project');

  const defaultName = path.basename(options.projectPath);
  const name = await clack.text({
    message: 'Project name',
    defaultValue: defaultName,
    placeholder: defaultName,
  });

  if (clack.isCancel(name)) {
    clack.cancel('Init cancelled.');
    return;
  }

  const bus = new EventBus();
  const pm = new ProjectManager(bus);
  const db = getDb();
  const installed = listInstalled(db);

  let selectedExtensions: string[] = [];
  if (installed.length > 0) {
    const choices = installed.map((ext) => ({
      value: ext.name,
      label: `${ext.name}@${ext.version}`,
    }));
    const selected = await clack.multiselect({
      message: 'Activate extensions',
      options: choices,
      required: false,
    });
    if (!clack.isCancel(selected)) {
      selectedExtensions = selected;
    }
  }

  pm.init(name, options.projectPath);

  for (const extName of selectedExtensions) {
    const ext = installed.find((e) => e.name === extName);
    if (ext) {
      await activate(ext.name, ext.version, options.projectPath, getExtensionDir(ext.name, ext.version));
    }
  }

  clack.outro('Project initialized!');
}
