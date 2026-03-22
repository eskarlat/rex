import { z } from 'zod';

import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export const argsSchema = z.object({
  url: z.string({ required_error: '--url is required' }).min(1, '--url is required'),
  wait: z.enum(['load', 'domcontentloaded']).default('domcontentloaded'),
});

export default async function navigate(context: ExecutionContext): Promise<CommandResult> {
  const { url, wait } = context.args as z.infer<typeof argsSchema>;

  return withBrowser(context.projectPath, async (_browser, page) => {
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
}
