vi.mock('../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../shared/client.js';
import { toOutput, errorOutput } from '../shared/formatters.js';
import type { ExecutionContext } from '../shared/types.js';
import status from './status.js';

const mockJira = {
  getMyself: vi.fn(),
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
  vi.mocked(createClients).mockReturnValue({
    jira: mockJira as never,
    confluence: {} as never,
  });
});

describe('status', () => {
  it('should call jira.getMyself and return connection info', async () => {
    mockJira.getMyself.mockResolvedValue({ accountId: 'u1', displayName: 'Test User' });
    const ctx = makeContext();
    const result = await status(ctx);
    expect(mockJira.getMyself).toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith({
      connected: true,
      user: { accountId: 'u1', displayName: 'Test User' },
      domain: 'test.atlassian.net',
      jiraCommands: 50,
      confluenceCommands: 23,
      totalCommands: 75,
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockJira.getMyself.mockRejectedValue(new Error('Unauthorized'));
    const result = await status(makeContext());
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
