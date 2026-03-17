import * as clack from '@clack/prompts';
import type { ConnectionState } from '../types/index.js';

export function handleExtStatus(connections: Map<string, ConnectionState>): void {
  if (connections.size === 0) {
    clack.log.info('No MCP connections active.');
    return;
  }

  const lines = Array.from(connections.entries()).map(
    ([name, state]) => `  ${name}: ${state}`,
  );
  clack.log.info(`MCP connection status:\n${lines.join('\n')}`);
}
