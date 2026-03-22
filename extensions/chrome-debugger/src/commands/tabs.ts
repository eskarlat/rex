import { connectBrowser } from '../shared/connection.js';
import { ensureBrowserRunning } from '../shared/state.js';
import { markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function tabs(context: ExecutionContext): Promise<CommandResult> {
  ensureBrowserRunning(context.projectPath);
  const browser = await connectBrowser(context.projectPath);

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
}
