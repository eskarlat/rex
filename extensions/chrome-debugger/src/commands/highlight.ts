import { withBrowser } from '../shared/connection.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function highlight(context: ExecutionContext): Promise<CommandResult> {
  const selector = context.args.selector;
  if (typeof selector !== 'string' || selector.length === 0) {
    return { output: 'Error: --selector is required', exitCode: 1 };
  }

  const duration = typeof context.args.duration === 'number' ? context.args.duration : 3000;

  return withBrowser(context.projectPath, async (_browser, page) => {
    const client = await page.createCDPSession();
    await client.send('DOM.enable');
    await client.send('Overlay.enable');

    // Find the element by selector
    const { root } = (await client.send('DOM.getDocument')) as {
      root: { nodeId: number };
    };

    const { nodeId } = (await client.send('DOM.querySelector', {
      nodeId: root.nodeId,
      selector,
    })) as { nodeId: number };

    if (nodeId === 0) {
      return {
        output: `No element found for selector: \`${selector}\``,
        exitCode: 1,
      };
    }

    // Highlight the element with a bright overlay
    await client.send('Overlay.highlightNode', {
      nodeId,
      highlightConfig: {
        showInfo: true,
        showStyles: true,
        showAccessibilityInfo: true,
        contentColor: { r: 111, g: 168, b: 220, a: 0.66 },
        paddingColor: { r: 147, g: 196, b: 125, a: 0.55 },
        borderColor: { r: 255, g: 229, b: 153, a: 0.66 },
        marginColor: { r: 246, g: 178, b: 107, a: 0.66 },
      },
    });

    // Keep highlight visible for the specified duration
    await new Promise((resolve) => setTimeout(resolve, duration));

    // Remove highlight
    await client.send('Overlay.hideHighlight');

    return {
      output: [
        `## Highlighted: \`${selector}\``,
        '',
        `Element was highlighted for ${String(duration / 1000)}s in the browser.`,
      ].join('\n'),
      exitCode: 0,
    };
  });
}
