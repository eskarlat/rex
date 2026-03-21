import * as clack from '@clack/prompts';

import { ProjectManager } from '../../../core/project/project-manager.js';
import { EventBus } from '../../../core/event-bus/event-bus.js';
import { getActivated, deactivate } from '../../extensions/manager/extension-manager.js';
import { getExtensionDir, getManifestPath  } from '../../../core/paths/paths.js';
import { cleanupCoreSkills } from '../../skills/core-skills-deployer.js';
import { pathExistsSync, readJsonSync } from '../../../shared/fs-helpers.js';
import type { ProjectManifest } from '../../../core/types/project.types.js';

interface DestroyOptions {
  projectPath: string;
  force: boolean;
}

export async function handleDestroy(options: DestroyOptions): Promise<void> {
  if (!options.force) {
    const confirmed = await clack.confirm({
      message: 'Are you sure you want to destroy this project? This cannot be undone.',
    });

    if (clack.isCancel(confirmed)) {
      clack.cancel('Destroy cancelled.');
      return;
    }

    if (!confirmed) {
      return;
    }
  }

  const plugins = getActivated(options.projectPath);
  for (const extName of Object.keys(plugins)) {
    const version = plugins[extName];
    if (version) {
      const extDir = getExtensionDir(extName, version);
      try {
        await deactivate(extName, options.projectPath, extDir);
      } catch {
        // Continue cleanup even if hook fails
      }
    }
  }

  const manifestPath = getManifestPath(options.projectPath);
  const agentDir = pathExistsSync(manifestPath)
    ? readJsonSync<ProjectManifest>(manifestPath).agentDir
    : undefined;
  cleanupCoreSkills(options.projectPath, agentDir);

  const bus = new EventBus();
  const pm = new ProjectManager(bus);
  pm.destroy(options.projectPath, true);
  clack.log.success('Project destroyed.');
}
