import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { basename, dirname, join, resolve } from 'node:path';

import { getScreenshotDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

function isInsideDir(filePath: string, dir: string): boolean {
  const resolvedDir = realpathSync(resolve(dir));
  const parentDir = dirname(resolve(filePath));
  const realParent = existsSync(parentDir) ? realpathSync(parentDir) : parentDir;
  const resolved = join(realParent, basename(filePath));
  return resolved.startsWith(resolvedDir + '/') || resolved.startsWith(resolvedDir + '\\');
}

export default function screenshotRead(context: ExecutionContext): CommandResult {
  const filePath = typeof context.args.path === 'string' ? context.args.path : null;

  if (!filePath) {
    return {
      output: JSON.stringify({ error: 'Missing --path argument' }),
      exitCode: 1,
    };
  }

  const screenshotDir = getScreenshotDir(context.projectPath);

  if (!isInsideDir(filePath, screenshotDir)) {
    return {
      output: JSON.stringify({ error: 'Path must be inside the screenshot directory' }),
      exitCode: 1,
    };
  }

  if (!existsSync(filePath)) {
    return {
      output: JSON.stringify({ error: `File not found: ${filePath}` }),
      exitCode: 1,
    };
  }

  // Verify symlinks don't escape the directory
  const realPath = realpathSync(filePath);
  if (!isInsideDir(realPath, screenshotDir)) {
    return {
      output: JSON.stringify({ error: 'Path must be inside the screenshot directory' }),
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
