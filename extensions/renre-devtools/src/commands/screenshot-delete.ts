import { existsSync, readFileSync, unlinkSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { getScreenshotDir } from '../shared/state.js';
import type { ExecutionContext, CommandResult, ScreenshotMeta } from '../shared/types.js';

export default function screenshotDelete(context: ExecutionContext): CommandResult {
  const filePath = typeof context.args.path === 'string' ? context.args.path : null;

  if (!filePath) {
    return {
      output: JSON.stringify({ error: 'Missing --path argument' }),
      exitCode: 1,
    };
  }

  // Delete the actual file
  if (existsSync(filePath)) {
    unlinkSync(filePath);
  }

  // Remove from metadata
  const screenshotDir = getScreenshotDir(context.projectPath);
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
