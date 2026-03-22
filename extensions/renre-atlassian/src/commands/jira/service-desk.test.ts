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
import getServiceDesks from './get-service-desks.js';
import getServiceDeskQueues from './get-service-desk-queues.js';
import getQueueIssues from './get-queue-issues.js';

const mockJira = {
  getServiceDesks: vi.fn(),
  getServiceDeskQueues: vi.fn(),
  getQueueIssues: vi.fn(),
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

describe('get-service-desks', () => {
  it('calls jira.getServiceDesks and returns result', async () => {
    const desks = { values: [{ id: 1, projectName: 'Support' }] };
    mockJira.getServiceDesks.mockResolvedValue(desks);
    const ctx = makeContext();
    await getServiceDesks(ctx);
    expect(mockJira.getServiceDesks).toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(desks);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getServiceDesks.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await getServiceDesks(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-service-desk-queues', () => {
  it('calls jira.getServiceDeskQueues with serviceDeskId', async () => {
    const queues = { values: [{ id: 10, name: 'Open' }] };
    mockJira.getServiceDeskQueues.mockResolvedValue(queues);
    const ctx = makeContext({ serviceDeskId: 1 });
    await getServiceDeskQueues(ctx);
    expect(mockJira.getServiceDeskQueues).toHaveBeenCalledWith(1);
    expect(toOutput).toHaveBeenCalledWith(queues);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getServiceDeskQueues.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ serviceDeskId: 1 });
    const result = await getServiceDeskQueues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-queue-issues', () => {
  it('calls jira.getQueueIssues with serviceDeskId and queueId', async () => {
    const issues = { values: [{ key: 'SD-1' }] };
    mockJira.getQueueIssues.mockResolvedValue(issues);
    const ctx = makeContext({ serviceDeskId: 1, queueId: 10 });
    await getQueueIssues(ctx);
    expect(mockJira.getQueueIssues).toHaveBeenCalledWith(1, 10);
    expect(toOutput).toHaveBeenCalledWith(issues);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getQueueIssues.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ serviceDeskId: 1, queueId: 10 });
    const result = await getQueueIssues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
