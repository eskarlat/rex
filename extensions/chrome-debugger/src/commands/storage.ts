import { withBrowser } from '../shared/connection.js';
import { getStorageEntries } from '../shared/browser-scripts.js';
import { markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function storage(context: ExecutionContext): Promise<CommandResult> {
  const storageType =
    typeof context.args.type === 'string' ? context.args.type : 'local';

  return withBrowser(context.projectPath, async (_browser, page) => {
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
}
