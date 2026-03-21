import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn() },
}));

vi.mock('../mcp/connection-manager.js', () => {
  const statusMap = new Map();
  return {
    ConnectionManager: vi.fn().mockImplementation(() => ({
      status: vi.fn().mockReturnValue(statusMap),
    })),
    __statusMap: statusMap,
  };
});

import * as clack from '@clack/prompts';
import { handleExtStatus } from './ext-status.command.js';

describe('ext-status command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows MCP connection states', () => {
    handleExtStatus(
      new Map([
        ['ext-a', 'running'],
        ['ext-b', 'stopped'],
      ]),
    );

    expect(clack.log.info).toHaveBeenCalled();
  });

  it('shows message when no MCP connections', () => {
    handleExtStatus(new Map());

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No MCP'));
  });
});
