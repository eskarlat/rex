import fs from 'node:fs';
import * as clack from '@clack/prompts';
import { remove, deactivate, getActivated } from '../manager/extension-manager.js';
import { getDb } from '../../../core/database/database.js';
import { getExtensionDir } from '../../../core/paths/paths.js';

interface ProjectRecord {
  name: string;
  path: string;
}

interface ExtRemoveOptions {
  name: string;
  version: string;
  projectPath: string | null;
}

function findProjectsUsingExtension(
  extensionName: string,
  currentProjectPath: string | null,
): string[] {
  const db = getDb();
  const projects = db.prepare('SELECT name, path FROM projects').all() as ProjectRecord[];
  const using: string[] = [];

  for (const project of projects) {
    if (project.path === currentProjectPath) continue;
    const plugins = getActivated(project.path);
    if (plugins[extensionName]) {
      using.push(`${project.name} (${project.path})`);
    }
  }

  return using;
}

export async function handleExtRemove(options: ExtRemoveOptions): Promise<void> {
  if (options.projectPath) {
    const extDir = getExtensionDir(options.name, options.version);
    try {
      await deactivate(options.name, options.projectPath, extDir);
      clack.log.info(`Deactivated ${options.name} from project.`);
    } catch {
      clack.log.warn(`Could not deactivate ${options.name} — continuing removal.`);
    }
  }

  const otherProjects = findProjectsUsingExtension(options.name, options.projectPath);
  if (otherProjects.length > 0) {
    const projectList = otherProjects.map((p) => `  - ${p}`).join('\n');
    clack.log.warn(`Extension "${options.name}" is still used by:\n${projectList}`);
  }

  const db = getDb();
  remove(options.name, options.version, db);

  const extDir = getExtensionDir(options.name, options.version);
  if (fs.existsSync(extDir)) {
    fs.rmSync(extDir, { recursive: true, force: true });
  }

  clack.log.success(`Removed ${options.name}@${options.version}.`);
}
