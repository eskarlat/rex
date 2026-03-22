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
import getWorklog from './get-worklog.js';
import addWorklog from './add-worklog.js';

const mockJira = {
  getWorklog: vi.fn(),
  addWorklog: vi.fn(),
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

describe('get-worklog', () => {
  it('calls jira.getWorklog with issueKey', async () => {
    const worklogs = { worklogs: [{ id: '1', timeSpent: '2h' }] };
    mockJira.getWorklog.mockResolvedValue(worklogs);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getWorklog.handler(ctx);
    expect(mockJira.getWorklog).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(worklogs);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getWorklog.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getWorklog.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('add-worklog', () => {
  it('calls jira.addWorklog with issueKey and worklog containing timeSpent', async () => {
    mockJira.addWorklog.mockResolvedValue({ id: '10' });
    const ctx = makeContext({ issueKey: 'TEST-1', timeSpent: '3h' });
    await addWorklog.handler(ctx);
    expect(mockJira.addWorklog).toHaveBeenCalledWith('TEST-1', { timeSpent: '3h' });
    expect(toOutput).toHaveBeenCalledWith({ id: '10' });
  });

  it('includes ADF comment when provided', async () => {
    mockJira.addWorklog.mockResolvedValue({ id: '11' });
    const ctx = makeContext({ issueKey: 'TEST-1', timeSpent: '1h', comment: 'Did some work' });
    await addWorklog.handler(ctx);
    expect(mockJira.addWorklog).toHaveBeenCalledWith('TEST-1', {
      timeSpent: '1h',
      comment: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Did some work' }],
          },
        ],
      },
    });
  });

  it('includes started when provided', async () => {
    mockJira.addWorklog.mockResolvedValue({ id: '12' });
    const ctx = makeContext({
      issueKey: 'TEST-1',
      timeSpent: '2h',
      started: '2026-01-01T09:00:00.000+0000',
    });
    await addWorklog.handler(ctx);
    expect(mockJira.addWorklog).toHaveBeenCalledWith('TEST-1', {
      timeSpent: '2h',
      started: '2026-01-01T09:00:00.000+0000',
    });
  });

  it('returns errorOutput on error', async () => {
    mockJira.addWorklog.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', timeSpent: '1h' });
    const result = await addWorklog.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
