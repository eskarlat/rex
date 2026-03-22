import { defineCommand } from '@renre-kit/extension-sdk/node';

import { connectBrowser } from '../shared/connection.js';
import { ensureBrowserRunning } from '../shared/state.js';
import { markdownTable, truncate } from '../shared/formatters.js';

export default defineCommand({
  handler: async (ctx) => {
    ensureBrowserRunning(ctx.projectPath);
    const browser = await connectBrowser(ctx.projectPath);

    const pages = await browser.pages();
    const rows: string[][] = [];

    for (let i = 0; i < pages.length; i++) {
      const page = pages[i];
      const title = await page.title();
      rows.push([String(i), truncate(title, 40), truncate(page.url(), 60)]);
    }

    const table = markdownTable(['Index', 'Title', 'URL'], rows);

    return {
      output: [`## Open Tabs (${String(pages.length)})`, '', table].join('\n'),
      exitCode: 0,
    };
  },
});
