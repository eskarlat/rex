import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function navigate(context: ExecutionContext): Promise<CommandResult> {
  const url = context.args.url;
  if (typeof url !== 'string' || url.length === 0) {
    return { output: 'Error: --url is required', exitCode: 1 };
  }

  return withBrowser(context.projectPath, async (_browser, page) => {
    const waitUntil = context.args.wait === 'load' ? 'load' : 'domcontentloaded';
    const response = await page.goto(url, { waitUntil });

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
