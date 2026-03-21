import { withBrowser } from '../shared/connection.js';
import { markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function storage(context: ExecutionContext): Promise<CommandResult> {
  const storageType =
    typeof context.args.type === 'string' ? context.args.type : 'local';

  return withBrowser(context.projectPath, async (_browser, page) => {
    const entries = await page.evaluate(/* istanbul ignore next -- browser-context */ (type) => {
      const store = type === 'session' ? sessionStorage : localStorage;
      const result: Array<{ key: string; value: string }> = [];
      for (let i = 0; i < store.length; i++) {
        const key = store.key(i);
        if (key) {
          result.push({ key, value: store.getItem(key) ?? '' });
        }
      }
      return result;
    }, storageType);

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
