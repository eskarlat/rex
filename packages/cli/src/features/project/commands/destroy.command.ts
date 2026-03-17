import * as clack from '@clack/prompts';
import { ProjectManager } from '../../../core/project/project-manager.js';
import { EventBus } from '../../../core/event-bus/event-bus.js';
import { getActivated, deactivate } from '../../extensions/manager/extension-manager.js';

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
      const extDir = `${extName}@${version}`;
      try {
        await deactivate(extName, options.projectPath, extDir);
      } catch {
        // Continue cleanup even if hook fails
      }
    }
  }

  const bus = new EventBus();
  const pm = new ProjectManager(bus);
  pm.destroy(options.projectPath, true);
  clack.log.success('Project destroyed.');
}
