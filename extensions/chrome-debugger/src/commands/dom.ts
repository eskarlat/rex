import { defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';
import { serializeSubtree, serializeFullPage } from '../shared/browser-scripts.js';
import { markdownCodeBlock } from '../shared/formatters.js';

export default defineCommand({
  handler: async (ctx) => {
    const selector = typeof ctx.args.selector === 'string' ? ctx.args.selector : null;
    const depth = typeof ctx.args.depth === 'number' ? ctx.args.depth : 5;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const html = selector
        ? await page.evaluate(serializeSubtree, selector, depth)
        : await page.evaluate(serializeFullPage, depth);

      const title = selector ? `DOM: \`${selector}\`` : 'DOM Tree';
      return {
        output: [`## ${title}`, '', markdownCodeBlock(html, 'html')].join('\n'),
        exitCode: 0,
      };
    });
  },
});
