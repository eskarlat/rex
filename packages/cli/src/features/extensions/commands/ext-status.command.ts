import * as clack from '@clack/prompts';
import type { ConnectionState } from '../types/index.js';

interface McpExtensionInfo {
  name: string;
  version: string;
}

export function handleExtStatus(
  connections: Map<string, ConnectionState>,
  installedMcpExtensions: McpExtensionInfo[] = [],
): void {
  const allNames = new Set([
    ...connections.keys(),
    ...installedMcpExtensions.map((e) => e.name),
  ]);

  if (allNames.size === 0) {
    clack.log.info('No MCP extensions installed.');
    return;
  }

  const lines = Array.from(allNames).map((name) => {
    const state = connections.get(name) ?? 'not connected';
    const ext = installedMcpExtensions.find((e) => e.name === name);
    const version = ext ? `@${ext.version}` : '';
    return `  ${name}${version}: ${state}`;
  });
  clack.log.info(`MCP connection status:\n${lines.join('\n')}`);
}
