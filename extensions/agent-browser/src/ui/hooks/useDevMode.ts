import { useState, useCallback, useEffect } from 'react';

import type { CdpClient } from '../lib/cdp-client.js';

export interface SelectedElement {
  selector: string;
  tagName: string;
  width: number;
  height: number;
  styles: Record<string, string>;
}

const HIGHLIGHT_CONFIG = {
  showInfo: true,
  contentColor: { r: 66, g: 133, b: 244, a: 0.3 },
  paddingColor: { r: 66, g: 133, b: 244, a: 0.15 },
  borderColor: { r: 66, g: 133, b: 244, a: 0.5 },
};

const INTERESTING_PROPS = new Set(['font-size', 'color', 'background-color', 'display', 'position']);

function getStringField(obj: Record<string, unknown>, key: string, fallback = ''): string {
  const val = obj[key];
  return typeof val === 'string' ? val : fallback;
}

function buildSelector(node: Record<string, unknown>): string {
  const tag = getStringField(node, 'localName');
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

function extractStyles(
  computedStyle: Array<{ name: string; value: string }> | undefined,
): Record<string, string> {
  const styles: Record<string, string> = {};
  for (const prop of computedStyle ?? []) {
    if (INTERESTING_PROPS.has(prop.name)) {
      styles[prop.name] = prop.value;
    }
  }
  return styles;
}

async function fetchNodeDetails(
  client: CdpClient,
  nodeId: number,
): Promise<SelectedElement | null> {
  const descResult = (await client.send('DOM.describeNode', { nodeId })) as {
    node?: Record<string, unknown>;
  };
  const node = descResult?.node;
  if (!node) return null;

  const boxResult = (await client.send('DOM.getBoxModel', { nodeId })) as {
    model?: { width?: number; height?: number };
  };
  const styleResult = (await client.send('CSS.getComputedStyleForNode', { nodeId })) as {
    computedStyle?: Array<{ name: string; value: string }>;
  };

  return {
    selector: buildSelector(node),
    tagName: getStringField(node, 'localName', getStringField(node, 'nodeName')),
    width: boxResult?.model?.width ?? 0,
    height: boxResult?.model?.height ?? 0,
    styles: extractStyles(styleResult?.computedStyle),
  };
}

async function enableDevTools(client: CdpClient): Promise<void> {
  await client.send('DOM.enable');
  await client.send('CSS.enable');
  await client.send('Overlay.enable');
  await client.send('Overlay.setInspectMode', {
    mode: 'searchForNode',
    highlightConfig: HIGHLIGHT_CONFIG,
  });
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
      await enableDevTools(client);
      setEnabled(true);
    }
  }, [client, enabled]);

  const inspectNode = useCallback(
    async (nodeId: number) => {
      if (!client?.connected) return;
      try {
        const element = await fetchNodeDetails(client, nodeId);
        if (element) setSelectedElement(element);
      } catch {
        // Node may have been removed
      }
    },
    [client],
  );

  useEffect(() => {
    if (!client?.connected || !enabled) return;

    const unsubscribe = client.on('Overlay.inspectNodeRequested', (params) => {
      const backendNodeId = params['backendNodeId'];
      if (typeof backendNodeId === 'number') {
        void (async () => {
          try {
            const resolveResult = (await client.send('DOM.pushNodesByBackendIdsToFrontend', {
              backendNodeIds: [backendNodeId],
            })) as { nodeIds?: number[] };
            const nodeId = resolveResult?.nodeIds?.[0];
            if (typeof nodeId === 'number') {
              await inspectNode(nodeId);
            }
          } catch {
            // Node may no longer exist
          }
        })();
      }
    });

    return unsubscribe;
  }, [client, enabled, inspectNode]);

  return { enabled, toggle, selectedElement, inspectNode, clearSelection: () => setSelectedElement(null) };
}
