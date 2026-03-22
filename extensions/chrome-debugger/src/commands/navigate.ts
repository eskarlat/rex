import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { withBrowser } from '../shared/connection.js';

export default defineCommand({
  args: {
    url: z.string({ required_error: '--url is required' }).min(1, '--url is required'),
    wait: z.enum(['load', 'domcontentloaded']).default('domcontentloaded'),
  },
  handler: async (ctx) => {
    const { url, wait } = ctx.args;

    return withBrowser(ctx.projectPath, async (_browser, page) => {
      const response = await page.goto(url, { waitUntil: wait });

      const status = response?.status() ?? 0;
      const title = await page.title();
      const finalUrl = page.url();

      return {
        output: [
          '## Navigated',
          '',
          `- **URL**: ${finalUrl}`,
          `- **Title**: ${title}`,
          `- **Status**: ${String(status)}`,
        ].join('\n'),
        exitCode: 0,
      };
    });
  },
});
