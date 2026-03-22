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
import getLabels from './get-labels.js';
import addLabel from './add-label.js';

const mockConfluence = {
  getLabels: vi.fn(),
  addLabel: vi.fn(),
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

describe('get-labels', () => {
  it('should get labels for a page', async () => {
    mockConfluence.getLabels.mockResolvedValue({ results: [{ name: 'api' }] });
    const ctx = makeContext({ pageId: '123' });
    const result = await getLabels(ctx);
    expect(mockConfluence.getLabels).toHaveBeenCalledWith('123');
    expect(toOutput).toHaveBeenCalledWith({ results: [{ name: 'api' }] });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getLabels.mockRejectedValue(new Error('fail'));
    const result = await getLabels(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('add-label', () => {
  it('should map string labels to objects and add them', async () => {
    mockConfluence.addLabel.mockResolvedValue({ results: [{ name: 'api' }, { name: 'docs' }] });
    const ctx = makeContext({ pageId: '123', labels: ['api', 'docs'] });
    const result = await addLabel(ctx);
    expect(mockConfluence.addLabel).toHaveBeenCalledWith('123', [
      { name: 'api' },
      { name: 'docs' },
    ]);
    expect(toOutput).toHaveBeenCalledWith({ results: [{ name: 'api' }, { name: 'docs' }] });
    expect(result.exitCode).toBe(0);
  });

  it('should handle a single label', async () => {
    mockConfluence.addLabel.mockResolvedValue({ results: [{ name: 'test' }] });
    const ctx = makeContext({ pageId: '123', labels: ['test'] });
    await addLabel(ctx);
    expect(mockConfluence.addLabel).toHaveBeenCalledWith('123', [{ name: 'test' }]);
  });

  it('should handle errors', async () => {
    mockConfluence.addLabel.mockRejectedValue(new Error('fail'));
    const result = await addLabel(makeContext({ pageId: '123', labels: ['x'] }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
