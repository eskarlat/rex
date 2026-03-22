vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext } from '../../shared/types.js';
import getTransitions from './get-transitions.js';
import transitionIssue from './transition-issue.js';

const mockJira = {
  getTransitions: vi.fn(),
  transitionIssue: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
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

describe('get-transitions', () => {
  it('calls jira.getTransitions with issueKey', async () => {
    const transitions = { transitions: [{ id: '1', name: 'Done' }] };
    mockJira.getTransitions.mockResolvedValue(transitions);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getTransitions(ctx);
    expect(mockJira.getTransitions).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(transitions);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getTransitions.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getTransitions(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('transition-issue', () => {
  it('calls jira.transitionIssue with issueKey and transitionId', async () => {
    mockJira.transitionIssue.mockResolvedValue(undefined);
    const ctx = makeContext({ issueKey: 'TEST-1', transitionId: '31' });
    await transitionIssue(ctx);
    expect(mockJira.transitionIssue).toHaveBeenCalledWith('TEST-1', '31');
    expect(toOutput).toHaveBeenCalledWith({ success: true, issueKey: 'TEST-1', transitionId: '31' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.transitionIssue.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', transitionId: '31' });
    const result = await transitionIssue(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
