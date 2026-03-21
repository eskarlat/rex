import path from 'node:path';

import * as clack from '@clack/prompts';

import { ProjectManager } from '../../../core/project/project-manager.js';
import { EventBus } from '../../../core/event-bus/event-bus.js';
import { getDb } from '../../../core/database/database.js';
import {
  listInstalled,
  activate,
  getActivated,
} from '../../extensions/manager/extension-manager.js';
import { getExtensionDir } from '../../../core/paths/paths.js';
import { ProjectAlreadyInitializedError } from '../../../core/types/errors.types.js';
import { deployCoreSkills } from '../../skills/core-skills-deployer.js';
import { handleDoctor } from '../../doctor/commands/doctor.command.js';

interface InitOptions {
  projectPath: string;
  force: boolean;
}

const LOGO = `
  ____                      _  ___ _
 |  _ \\ ___ _ __  _ __ ___| |/ (_) |_
 | |_) / _ \\ '_ \\| '__/ _ \\ ' /| | __|
 |  _ <  __/ | | | | |  __/ . \\| | |_
 |_| \\_\\___|_| |_|_|  \\___|_|\\_\\_|\\__|
`;

export async function handleInit(options: InitOptions): Promise<void> {
  process.stdout.write(LOGO);
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

  const agentDir = await clack.select({
    message: 'Agent assets directory',
    options: [
      { value: '.github', label: '.github' },
      { value: '.agents', label: '.agents' },
    ],
    initialValue: '.github',
  });

  if (clack.isCancel(agentDir)) {
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

  try {
    pm.init(name, options.projectPath, agentDir);
  } catch (err: unknown) {
    if (err instanceof ProjectAlreadyInitializedError) {
      clack.log.warn(err.message);
      clack.outro('Nothing to do.');
      return;
    }
    throw err;
  }

  deployCoreSkills(options.projectPath, agentDir);

  for (const extName of selectedExtensions) {
    const ext = installed.find((e) => e.name === extName);
    if (ext) {
      await activate(
        ext.name,
        ext.version,
        options.projectPath,
        getExtensionDir(ext.name, ext.version),
      );
    }
  }

  clack.outro('Project initialized!');

  await promptDoctor(options.projectPath);
}

async function promptDoctor(projectPath: string): Promise<void> {
  const runDoctor = await clack.confirm({
    message: 'Run diagnostic checks?',
  });

  if (!clack.isCancel(runDoctor) && runDoctor) {
    const getActivatedFn = (): Record<string, string> => getActivated(projectPath);
    await handleDoctor(projectPath, getActivatedFn);
  }
}
