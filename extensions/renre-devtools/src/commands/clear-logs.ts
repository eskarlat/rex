import { existsSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getLogDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default function clearLogs(context: ExecutionContext): CommandResult {
  const logDir = getLogDir(context.projectPath);
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
}
