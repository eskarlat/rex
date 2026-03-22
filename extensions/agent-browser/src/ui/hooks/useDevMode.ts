import { useState, useCallback } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';

export interface SelectedElement {
  selector: string;
  tagName: string;
  width: number;
  height: number;
  styles: Record<string, string>;
}

export function useDevMode(client: CdpClient | null) {
  const [enabled, setEnabled] = useState(false);
  const [selectedElement, setSelectedElement] = useState<SelectedElement | null>(null);

  const toggle = useCallback(async () => {
    if (!client?.connected) return;

    if (enabled) {
      await client.send('Overlay.disable');
      setEnabled(false);
      setSelectedElement(null);
    } else {
      await client.send('DOM.enable');
      await client.send('CSS.enable');
      await client.send('Overlay.enable');
      await client.send('Overlay.setInspectMode', {
        mode: 'searchForNode',
        highlightConfig: {
          showInfo: true,
          contentColor: { r: 66, g: 133, b: 244, a: 0.3 },
          paddingColor: { r: 66, g: 133, b: 244, a: 0.15 },
          borderColor: { r: 66, g: 133, b: 244, a: 0.5 },
        },
      });
      setEnabled(true);
    }
  }, [client, enabled]);

  const inspectNode = useCallback(
    async (nodeId: number) => {
      if (!client?.connected) return;

      try {
        const descResult = (await client.send('DOM.describeNode', { nodeId })) as {
          node?: Record<string, unknown>;
        };
        const node = descResult?.node;
        if (!node) return;

        const boxResult = (await client.send('DOM.getBoxModel', { nodeId })) as {
          model?: { width?: number; height?: number };
        };

        const styleResult = (await client.send('CSS.getComputedStyleForNode', { nodeId })) as {
          computedStyle?: Array<{ name: string; value: string }>;
        };

        const styles: Record<string, string> = {};
        const interestingProps = ['font-size', 'color', 'background-color', 'display', 'position'];
        for (const prop of styleResult?.computedStyle ?? []) {
          if (interestingProps.includes(prop.name)) {
            styles[prop.name] = prop.value;
          }
        }

        setSelectedElement({
          selector: buildSelector(node),
          tagName: String(node['localName'] ?? node['nodeName'] ?? ''),
          width: boxResult?.model?.width ?? 0,
          height: boxResult?.model?.height ?? 0,
          styles,
        });
      } catch {
        // Node may have been removed
      }
    },
    [client],
  );

  return { enabled, toggle, selectedElement, inspectNode, clearSelection: () => setSelectedElement(null) };
}

function buildSelector(node: Record<string, unknown>): string {
  const tag = String(node['localName'] ?? '');
  const attrs = node['attributes'] as string[] | undefined;
  let id = '';
  let className = '';

  if (attrs) {
    for (let i = 0; i < attrs.length; i += 2) {
      if (attrs[i] === 'id') id = attrs[i + 1] ?? '';
      if (attrs[i] === 'class') className = attrs[i + 1] ?? '';
    }
  }

  if (id) return `${tag}#${id}`;
  if (className) {
    const classes = className.split(/\s+/).filter(Boolean).slice(0, 2).join('.');
    return `${tag}.${classes}`;
  }
  return tag;
}
