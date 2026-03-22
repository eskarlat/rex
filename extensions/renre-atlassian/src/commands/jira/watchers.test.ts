vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { CommandContext } from '../../shared/types.js';
import getIssueWatchers from './get-issue-watchers.js';
import addWatcher from './add-watcher.js';
import removeWatcher from './remove-watcher.js';

const mockJira = {
  getWatchers: vi.fn(),
  addWatcher: vi.fn(),
  removeWatcher: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): CommandContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClients).mockReturnValue({ jira: mockJira as never, confluence: {} as never });
});

describe('get-issue-watchers', () => {
  it('calls jira.getWatchers with issueKey', async () => {
    const watchers = { watchers: [{ accountId: 'abc' }] };
    mockJira.getWatchers.mockResolvedValue(watchers);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueWatchers.handler(ctx);
    expect(mockJira.getWatchers).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(watchers);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getWatchers.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssueWatchers.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('add-watcher', () => {
  it('calls jira.addWatcher with issueKey and accountId', async () => {
    mockJira.addWatcher.mockResolvedValue(undefined);
    const ctx = makeContext({ issueKey: 'TEST-1', accountId: 'abc123' });
    await addWatcher.handler(ctx);
    expect(mockJira.addWatcher).toHaveBeenCalledWith('TEST-1', 'abc123');
    expect(toOutput).toHaveBeenCalledWith({ success: true });
  });

  it('returns errorOutput on error', async () => {
    mockJira.addWatcher.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', accountId: 'abc123' });
    const result = await addWatcher.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('remove-watcher', () => {
  it('calls jira.removeWatcher with issueKey and accountId', async () => {
    mockJira.removeWatcher.mockResolvedValue(undefined);
    const ctx = makeContext({ issueKey: 'TEST-1', accountId: 'abc123' });
    await removeWatcher.handler(ctx);
    expect(mockJira.removeWatcher).toHaveBeenCalledWith('TEST-1', 'abc123');
    expect(toOutput).toHaveBeenCalledWith({ success: true });
  });

  it('returns errorOutput on error', async () => {
    mockJira.removeWatcher.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', accountId: 'abc123' });
    const result = await removeWatcher.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
