import { renameSync, existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { isInsideProject } from './path-guard.js';

export default defineCommand({
  args: {
    oldPath: z.string(),
    newPath: z.string(),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const sourcePath = resolve(projectPath, ctx.args.oldPath);
    const destPath = resolve(projectPath, ctx.args.newPath);

    if (!isInsideProject(projectPath, sourcePath)) {
      return {
        output: JSON.stringify({ error: 'Source path outside project directory' }),
        exitCode: 1,
      };
    }
    if (!isInsideProject(projectPath, destPath)) {
      return {
        output: JSON.stringify({ error: 'Destination path outside project directory' }),
        exitCode: 1,
      };
    }

    if (!existsSync(sourcePath)) {
      return { output: JSON.stringify({ error: 'Source path does not exist' }), exitCode: 1 };
    }

    if (existsSync(destPath)) {
      return {
        output: JSON.stringify({ error: 'Destination path already exists' }),
        exitCode: 1,
      };
    }

    try {
      mkdirSync(dirname(destPath), { recursive: true });
      renameSync(sourcePath, destPath);

      return {
        output: JSON.stringify({
          success: true,
          oldPath: ctx.args.oldPath,
          newPath: ctx.args.newPath,
        }),
        exitCode: 0,
      };
    } catch {
      return {
        output: JSON.stringify({ error: 'Failed to rename/move' }),
        exitCode: 1,
      };
    }
  },
});
