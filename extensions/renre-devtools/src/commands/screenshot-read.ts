import { existsSync, readFileSync } from 'node:fs';

import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default function screenshotRead(context: ExecutionContext): CommandResult {
  const filePath = typeof context.args.path === 'string' ? context.args.path : null;

  if (!filePath) {
    return {
      output: JSON.stringify({ error: 'Missing --path argument' }),
      exitCode: 1,
    };
  }

  if (!existsSync(filePath)) {
    return {
      output: JSON.stringify({ error: `File not found: ${filePath}` }),
      exitCode: 1,
    };
  }

  const buffer = readFileSync(filePath);
  const base64 = buffer.toString('base64');

  return {
    output: JSON.stringify({
      dataUrl: `data:image/png;base64,${base64}`,
    }),
    exitCode: 0,
  };
}
