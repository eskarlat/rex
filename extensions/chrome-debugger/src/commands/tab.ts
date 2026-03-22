import { defineCommand } from '@renre-kit/extension-sdk/node';

import { connectBrowser, getPageByIndex } from '../shared/connection.js';
import { ensureBrowserRunning } from '../shared/state.js';

export default defineCommand({
  handler: async (ctx) => {
    const positional = Array.isArray(ctx.args._positional) ? ctx.args._positional : [];
    const index = Number(ctx.args.index ?? positional[0]);
    if (Number.isNaN(index)) {
      return { output: 'Error: --index <number> is required', exitCode: 1 };
    }

    ensureBrowserRunning(ctx.projectPath);
    const browser = await connectBrowser(ctx.projectPath);

    const page = await getPageByIndex(browser, index);
    await page.bringToFront();
    const title = await page.title();

    return {
      output: [
        '## Switched Tab',
        '',
        `- **Index**: ${String(index)}`,
        `- **Title**: ${title}`,
        `- **URL**: ${page.url()}`,
      ].join('\n'),
      exitCode: 0,
    };
  },
});
