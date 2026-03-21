import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

import * as clack from '@clack/prompts';
import { handleExtStatus } from './ext-status.command.js';

describe('ext-status command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows MCP connection states for active connections', () => {
    handleExtStatus(
      new Map([
        ['ext-a', 'running'],
        ['ext-b', 'stopped'],
      ]),
    );

    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('ext-a: running'),
    );
    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('ext-b: stopped'),
    );
  });

  it('shows installed MCP extensions as not connected when no active connections', () => {
    handleExtStatus(new Map(), [
      { name: 'github-mcp', version: '1.0.0' },
      { name: 'figma-mcp', version: '2.1.0' },
    ]);

    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('github-mcp@1.0.0: not connected'),
    );
    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('figma-mcp@2.1.0: not connected'),
    );
  });

  it('merges active connections with installed MCP extensions', () => {
    handleExtStatus(
      new Map([['github-mcp', 'running']]),
      [
        { name: 'github-mcp', version: '1.0.0' },
        { name: 'figma-mcp', version: '2.1.0' },
      ],
    );

    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('github-mcp@1.0.0: running'),
    );
    expect(clack.log.info).toHaveBeenCalledWith(
      expect.stringContaining('figma-mcp@2.1.0: not connected'),
    );
  });

  it('shows message when no MCP extensions installed and no connections', () => {
    handleExtStatus(new Map());

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No MCP'));
  });
});
