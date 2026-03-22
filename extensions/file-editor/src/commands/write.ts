import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';

import { z, defineCommand } from '@renre-kit/extension-sdk/node';

export default defineCommand({
  args: {
    path: z.string(),
    content: z.string(),
  },
  handler: (ctx) => {
    const projectPath = ctx.projectPath;
    const filePath = resolve(projectPath, ctx.args.path);

    if (!filePath.startsWith(resolve(projectPath))) {
      return { output: JSON.stringify({ error: 'Path outside project directory' }), exitCode: 1 };
    }

    try {
      mkdirSync(dirname(filePath), { recursive: true });
      writeFileSync(filePath, ctx.args.content, 'utf-8');

      return {
        output: JSON.stringify({ success: true, path: ctx.args.path }),
        exitCode: 0,
      };
    } catch {
      return {
        output: JSON.stringify({ error: 'Failed to write file' }),
        exitCode: 1,
      };
    }
  },
});
