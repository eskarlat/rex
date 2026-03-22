import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineCommand } from '@renre-kit/extension-sdk/node';

import { getLogDir } from '../shared/state.js';

export default defineCommand({
  handler: (ctx) => {
    const logDir = getLogDir(ctx.projectPath);
    let cleared = 0;

    for (const file of ['network.jsonl', 'console.jsonl']) {
      const logPath = join(logDir, file);
      if (existsSync(logPath)) {
        writeFileSync(logPath, '');
        cleared++;
      }
    }

    return {
      output: JSON.stringify({ cleared, files: ['network.jsonl', 'console.jsonl'] }),
      exitCode: 0,
    };
  },
});
