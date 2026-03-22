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
import getUserProfile from './get-user-profile.js';

const mockJira = {
  getMyself: vi.fn(),
  getUser: vi.fn(),
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

describe('get-user-profile', () => {
  it('calls jira.getMyself when no accountId is provided', async () => {
    const user = { accountId: 'me', displayName: 'Me' };
    mockJira.getMyself.mockResolvedValue(user);
    const ctx = makeContext();
    await getUserProfile(ctx);
    expect(mockJira.getMyself).toHaveBeenCalled();
    expect(mockJira.getUser).not.toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(user);
  });

  it('calls jira.getUser when accountId is provided', async () => {
    const user = { accountId: 'abc123', displayName: 'John' };
    mockJira.getUser.mockResolvedValue(user);
    const ctx = makeContext({ accountId: 'abc123' });
    await getUserProfile(ctx);
    expect(mockJira.getUser).toHaveBeenCalledWith('abc123');
    expect(mockJira.getMyself).not.toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(user);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getMyself.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await getUserProfile(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
