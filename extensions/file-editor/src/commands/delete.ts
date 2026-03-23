import { rmSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { isInsideProject } from './path-guard.js';

export default defineCommand({
  args: {
    path: z.string(),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const targetPath = resolve(projectPath, ctx.args.path);

    if (!isInsideProject(projectPath, targetPath)) {
      return { output: JSON.stringify({ error: 'Path outside project directory' }), exitCode: 1 };
    }

    if (!existsSync(targetPath)) {
      return { output: JSON.stringify({ error: 'Path does not exist' }), exitCode: 1 };
    }

    // Prevent deleting the project root
    if (resolve(targetPath) === resolve(projectPath)) {
      return { output: JSON.stringify({ error: 'Cannot delete project root' }), exitCode: 1 };
    }

    try {
      rmSync(targetPath, { recursive: true, force: true });

      return {
        output: JSON.stringify({ success: true, path: ctx.args.path }),
        exitCode: 0,
      };
    } catch {
      return {
        output: JSON.stringify({ error: 'Failed to delete path' }),
        exitCode: 1,
      };
    }
  },
});
