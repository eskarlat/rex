import { existsSync, readFileSync, realpathSync, unlinkSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

import { getScreenshotDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult, ScreenshotMeta } from '../shared/types.js';

function isInsideDir(filePath: string, dir: string): boolean {
  const resolved = resolve(filePath);
  const resolvedDir = resolve(dir);
  return resolved.startsWith(resolvedDir + '/') || resolved.startsWith(resolvedDir + '\\');
}

export default function screenshotDelete(context: ExecutionContext): CommandResult {
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

  // Verify symlinks don't escape the directory
  if (existsSync(filePath)) {
    const realPath = realpathSync(filePath);
    if (!isInsideDir(realPath, screenshotDir)) {
      return {
        output: JSON.stringify({ error: 'Path must be inside the screenshot directory' }),
        exitCode: 1,
      };
    }
    unlinkSync(filePath);
  }

  // Remove from metadata
  const metaPath = join(screenshotDir, 'screenshots.jsonl');

  if (existsSync(metaPath)) {
    const raw = readFileSync(metaPath, 'utf-8').trim();
    if (raw.length > 0) {
      const entries = raw
        .split('\n')
        .map((line) => JSON.parse(line) as ScreenshotMeta)
        .filter((meta) => meta.path !== filePath);

      writeFileSync(
        metaPath,
        entries.map((e) => JSON.stringify(e)).join('\n') + (entries.length > 0 ? '\n' : '')
      );
    }
  }

  return {
    output: JSON.stringify({ deleted: true, path: filePath }),
    exitCode: 0,
  };
}
