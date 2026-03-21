import { withBrowser } from '../shared/connection.js';
import { markdownTable, truncate } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

function queryElements(sel: string): Array<{
  index: number;
  tag: string;
  id: string;
  classes: string;
  text: string;
  attrs: string;
}> {
  const els = document.querySelectorAll(sel);
  return Array.from(els).map((el, i) => ({
    index: i,
    tag: el.tagName.toLowerCase(),
    id: el.id || '',
    classes: Array.from(el.classList).join(' '),
    text: (el.textContent?.trim() ?? '').slice(0, 80),
    attrs: Array.from(el.attributes)
      .filter((a) => !['id', 'class'].includes(a.name))
      .map((a) => `${a.name}="${a.value}"`)
      .join(', '),
  }));
}

export default async function select(context: ExecutionContext): Promise<CommandResult> {
  const selector = context.args.selector;
  if (typeof selector !== 'string' || selector.length === 0) {
    return { output: 'Error: --selector is required', exitCode: 1 };
  }

  return withBrowser(context.projectPath, async (_browser, page) => {
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
}
