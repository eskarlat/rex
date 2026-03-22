import { defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';
import { getStorageEntries } from '../shared/browser-scripts.js';
import { markdownTable, truncate } from '../shared/formatters.js';

export default defineCommand({
  handler: async (ctx) => {
    const storageType =
      typeof ctx.args.type === 'string' ? ctx.args.type : 'local';

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const entries = await page.evaluate(getStorageEntries, storageType);

      const label = storageType === 'session' ? 'sessionStorage' : 'localStorage';

      if (entries.length === 0) {
        return { output: `${label} is empty.`, exitCode: 0 };
      }

      const rows = entries.map((e) => [truncate(e.key, 40), truncate(e.value, 60)]);
      const table = markdownTable(['Key', 'Value'], rows);

      return {
        output: [`## ${label} (${String(entries.length)} entries)`, '', table].join('\n'),
        exitCode: 0,
      };
    });
  },
});
