import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { isInsideProject } from './path-guard.js';

export default defineCommand({
  args: {
    path: z.string(),
    type: z.enum(['file', 'directory']),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const targetPath = resolve(projectPath, ctx.args.path);

    if (!isInsideProject(projectPath, targetPath)) {
      return { output: JSON.stringify({ error: 'Path outside project directory' }), exitCode: 1 };
    }

    if (existsSync(targetPath)) {
      return { output: JSON.stringify({ error: 'Path already exists' }), exitCode: 1 };
    }

    try {
      if (ctx.args.type === 'directory') {
        mkdirSync(targetPath, { recursive: true });
      } else {
        mkdirSync(dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, '', 'utf-8');
      }

      return {
        output: JSON.stringify({ success: true, path: ctx.args.path, type: ctx.args.type }),
        exitCode: 0,
      };
    } catch {
      return {
        output: JSON.stringify({ error: `Failed to create ${ctx.args.type}` }),
        exitCode: 1,
      };
    }
  },
});
