import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { defineCommand } from '@renre-kit/extension-sdk/node';

import { getScreenshotDir } from '../shared/state.js';
import type { ScreenshotMeta } from '../shared/types.js';

export default defineCommand({
  handler: (ctx) => {
    const screenshotDir = getScreenshotDir(ctx.projectPath);
    const metaPath = join(screenshotDir, 'screenshots.jsonl');

    if (!existsSync(metaPath)) {
      return {
        output: JSON.stringify({ screenshots: [] }),
        exitCode: 0,
      };
    }

    const raw = readFileSync(metaPath, 'utf-8').trim();
    if (raw.length === 0) {
      return {
        output: JSON.stringify({ screenshots: [] }),
        exitCode: 0,
      };
    }

    const screenshots: ScreenshotMeta[] = raw
      .split('\n')
      .map((line) => JSON.parse(line) as ScreenshotMeta)
      .filter((meta) => existsSync(meta.path));

    return {
      output: JSON.stringify({ screenshots }),
      exitCode: 0,
    };
  },
});
