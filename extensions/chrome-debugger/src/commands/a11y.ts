import { withBrowser } from '../shared/connection.js';
import { markdownCodeBlock } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

interface AXNode {
  role?: { value: string };
  name?: { value: string };
  value?: { value: string };
  description?: { value: string };
  children?: AXNode[];
  properties?: Array<{ name: string; value: { value: unknown } }>;
  ignored?: boolean;
}

export default async function a11y(context: ExecutionContext): Promise<CommandResult> {
  const selector = typeof context.args.selector === 'string' ? context.args.selector : null;
  const depth = typeof context.args.depth === 'number' ? context.args.depth : 5;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();

    const params: Record<string, unknown> = {};

    if (selector) {
      const element = await page.$(selector);
      if (!element) {
        return {
          output: `No element found for selector: \`${selector}\``,
          exitCode: 1,
        };
      }
      const { node } = (await client.send('DOM.describeNode', {
        objectId: element.remoteObject().objectId,
      })) as { node: { backendNodeId: number } };
      params.backendNodeId = node.backendNodeId;
      params.depth = depth;
    } else {
      params.depth = depth;
    }

    const { nodes } = (await client.send('Accessibility.getFullAXTree', params)) as {
      nodes: AXNode[];
    };

    const lines: string[] = [];
    function renderNode(node: AXNode, indent: number): void {
      if (node.ignored) return;
      const role = node.role?.value ?? 'unknown';
      const name = node.name?.value ?? '';
      const prefix = '  '.repeat(indent);
      const label = name ? `${role} "${name}"` : role;
      lines.push(`${prefix}- ${label}`);

      if (node.children) {
        for (const child of node.children) {
          renderNode(child, indent + 1);
        }
      }
    }

    for (const node of nodes.slice(0, 1)) {
      renderNode(node, 0);
    }

    const tree = lines.length > 0 ? lines.join('\n') : 'Empty accessibility tree';
    const title = selector ? `Accessibility Tree: \`${selector}\`` : 'Accessibility Tree';

    return {
      output: [`## ${title}`, '', markdownCodeBlock(tree)].join('\n'),
      exitCode: 0,
    };
  });
}
