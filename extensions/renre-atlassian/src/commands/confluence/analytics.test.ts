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
import getPageViews from './get-page-views.js';

const mockConfluence = {
  getPageViews: vi.fn(),
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
  vi.mocked(createClients).mockReturnValue({
    jira: {} as never,
    confluence: mockConfluence as never,
  });
});

describe('get-page-views', () => {
  it('should get page views without fromDate', async () => {
    mockConfluence.getPageViews.mockResolvedValue({ count: 42 });
    const ctx = makeContext({ pageId: '123' });
    const result = await getPageViews.handler(ctx);
    expect(mockConfluence.getPageViews).toHaveBeenCalledWith('123', undefined);
    expect(toOutput).toHaveBeenCalledWith({ count: 42 });
    expect(result.exitCode).toBe(0);
  });

  it('should get page views with fromDate', async () => {
    mockConfluence.getPageViews.mockResolvedValue({ count: 10 });
    const ctx = makeContext({ pageId: '123', fromDate: '2025-01-01' });
    const result = await getPageViews.handler(ctx);
    expect(mockConfluence.getPageViews).toHaveBeenCalledWith('123', '2025-01-01');
    expect(toOutput).toHaveBeenCalledWith({ count: 10 });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getPageViews.mockRejectedValue(new Error('fail'));
    const result = await getPageViews.handler(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
