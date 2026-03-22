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
import getDevInfo from './get-dev-info.js';
import getDevSummary from './get-dev-summary.js';
import getBatchDevInfo from './get-batch-dev-info.js';

const mockJira = {
  getDevelopmentInfo: vi.fn(),
  getDevelopmentSummary: vi.fn(),
  getBatchDevelopmentInfo: vi.fn(),
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

describe('get-dev-info', () => {
  it('calls jira.getDevelopmentInfo with issueId and optional params', async () => {
    const devInfo = { detail: [{ branches: [] }] };
    mockJira.getDevelopmentInfo.mockResolvedValue(devInfo);
    const ctx = makeContext({
      issueId: '10001',
      applicationType: 'GitHub',
      dataType: 'branch',
    });
    await getDevInfo(ctx);
    expect(mockJira.getDevelopmentInfo).toHaveBeenCalledWith('10001', 'GitHub', 'branch');
    expect(toOutput).toHaveBeenCalledWith(devInfo);
  });

  it('passes undefined for optional params when not provided', async () => {
    mockJira.getDevelopmentInfo.mockResolvedValue({ detail: [] });
    const ctx = makeContext({ issueId: '10001' });
    await getDevInfo(ctx);
    expect(mockJira.getDevelopmentInfo).toHaveBeenCalledWith('10001', undefined, undefined);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getDevelopmentInfo.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueId: '10001' });
    const result = await getDevInfo(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-dev-summary', () => {
  it('calls jira.getDevelopmentSummary with issueId', async () => {
    const summary = { summary: { branch: { count: 2 }, pullrequest: { count: 1 } } };
    mockJira.getDevelopmentSummary.mockResolvedValue(summary);
    const ctx = makeContext({ issueId: '10001' });
    await getDevSummary(ctx);
    expect(mockJira.getDevelopmentSummary).toHaveBeenCalledWith('10001');
    expect(toOutput).toHaveBeenCalledWith(summary);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getDevelopmentSummary.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueId: '10001' });
    const result = await getDevSummary(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-batch-dev-info', () => {
  it('calls jira.getBatchDevelopmentInfo with issueIds and optional params', async () => {
    const batchInfo = { devInformation: [] };
    mockJira.getBatchDevelopmentInfo.mockResolvedValue(batchInfo);
    const ctx = makeContext({
      issueIds: ['10001', '10002'],
      applicationType: 'GitHub',
      dataType: 'pullrequest',
    });
    await getBatchDevInfo(ctx);
    expect(mockJira.getBatchDevelopmentInfo).toHaveBeenCalledWith(
      ['10001', '10002'],
      'GitHub',
      'pullrequest',
    );
    expect(toOutput).toHaveBeenCalledWith(batchInfo);
  });

  it('passes undefined for optional params when not provided', async () => {
    mockJira.getBatchDevelopmentInfo.mockResolvedValue({ devInformation: [] });
    const ctx = makeContext({ issueIds: ['10001'] });
    await getBatchDevInfo(ctx);
    expect(mockJira.getBatchDevelopmentInfo).toHaveBeenCalledWith(
      ['10001'],
      undefined,
      undefined,
    );
  });

  it('returns errorOutput on error', async () => {
    mockJira.getBatchDevelopmentInfo.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueIds: ['10001'] });
    const result = await getBatchDevInfo(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
