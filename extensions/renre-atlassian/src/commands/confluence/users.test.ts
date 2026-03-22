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
import searchUser from './search-user.js';

const mockConfluence = {
  searchUser: vi.fn(),
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
    jira: {} as never,
    confluence: mockConfluence as never,
  });
});

describe('search-user', () => {
  it('should search for a user by query', async () => {
    mockConfluence.searchUser.mockResolvedValue({
      results: [{ accountId: 'u1', displayName: 'Jane Smith' }],
    });
    const ctx = makeContext({ query: 'Jane' });
    const result = await searchUser(ctx);
    expect(mockConfluence.searchUser).toHaveBeenCalledWith('Jane');
    expect(toOutput).toHaveBeenCalledWith({
      results: [{ accountId: 'u1', displayName: 'Jane Smith' }],
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.searchUser.mockRejectedValue(new Error('fail'));
    const result = await searchUser(makeContext({ query: 'nobody' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
