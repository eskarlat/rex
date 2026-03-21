import { withBrowser } from '../shared/connection.js';
import { markdownCodeBlock } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

// Serialization functions are passed to page.evaluate() and run in the browser context.
// They must be self-contained — cannot reference outer scope.

/* istanbul ignore next -- browser-context function */
function serializeSubtree(sel: string, maxDepth: number): string {
  function serialize(node: Element, currentDepth: number): string {
    if (currentDepth <= 0) return '...';
    const tag = node.tagName.toLowerCase();
    const attrs = Array.from(node.attributes)
      .map((a) => `${a.name}="${a.value}"`)
      .join(' ');
    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

    if (node.children.length === 0) {
      const text = node.textContent?.trim() ?? '';
      return text ? `${open}${text}</${tag}>` : `${open}</${tag}>`;
    }

    const children = Array.from(node.children)
      .map((child) => serialize(child, currentDepth - 1))
      .join('\n');
    return `${open}\n${children}\n</${tag}>`;
  }

  const el = document.querySelector(sel);
  if (!el) return `No element found for selector: ${sel}`;
  return serialize(el, maxDepth);
}

/* istanbul ignore next -- browser-context function */
function serializeFullPage(maxDepth: number): string {
  function serialize(node: Element, currentDepth: number): string {
    if (currentDepth <= 0) return '...';
    const tag = node.tagName.toLowerCase();
    const attrs = Array.from(node.attributes)
      .map((a) => `${a.name}="${a.value}"`)
      .join(' ');
    const open = attrs ? `<${tag} ${attrs}>` : `<${tag}>`;

    if (node.children.length === 0) {
      const text = node.textContent?.trim().slice(0, 100) ?? '';
      return text ? `${open}${text}</${tag}>` : `${open}</${tag}>`;
    }

    const children = Array.from(node.children)
      .map((child) => serialize(child, currentDepth - 1))
      .join('\n');
    return `${open}\n${children}\n</${tag}>`;
  }

  return serialize(document.documentElement, maxDepth);
}

export default async function dom(context: ExecutionContext): Promise<CommandResult> {
  const selector = typeof context.args.selector === 'string' ? context.args.selector : null;
  const depth = typeof context.args.depth === 'number' ? context.args.depth : 5;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const html = selector
      ? await page.evaluate(serializeSubtree, selector, depth)
      : await page.evaluate(serializeFullPage, depth);

    const title = selector ? `DOM: \`${selector}\`` : 'DOM Tree';
    return {
      output: [`## ${title}`, '', markdownCodeBlock(html, 'html')].join('\n'),
      exitCode: 0,
    };
  });
}
