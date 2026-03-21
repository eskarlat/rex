import { connectBrowser, getPageByIndex } from '../shared/connection.js';
import { ensureBrowserRunning } from '../shared/state.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function tab(context: ExecutionContext): Promise<CommandResult> {
  const positional = Array.isArray(context.args._positional) ? context.args._positional : [];
  const index = Number(context.args.index ?? positional[0]);
  if (Number.isNaN(index)) {
    return { output: 'Error: --index <number> is required', exitCode: 1 };
  }

  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);

  try {
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
  } finally {
    void browser.disconnect();
  }
}
