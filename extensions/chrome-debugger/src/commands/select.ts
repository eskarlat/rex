import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';
import { queryElements } from '../shared/browser-scripts.js';
import { markdownTable, truncate } from '../shared/formatters.js';

export default defineCommand({
  args: {
    selector: z.string({ required_error: '--selector is required' }).min(1, '--selector is required'),
  },
  handler: async (ctx) => {
    const { selector } = ctx.args;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const elements = await page.evaluate(queryElements, selector);

      if (elements.length === 0) {
        return {
          output: `No elements found for selector: \`${selector}\``,
          exitCode: 0,
        };
      }

      const rows = elements.map((el) => [
        String(el.index),
        el.tag,
        el.id,
        truncate(el.classes, 30),
        truncate(el.text, 40),
      ]);

      const table = markdownTable(['#', 'Tag', 'ID', 'Classes', 'Text'], rows);

      return {
        output: [
          `## Select: \`${selector}\` (${String(elements.length)} found)`,
          '',
          table,
        ].join('\n'),
        exitCode: 0,
      };
    });
  },
});
