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
import getIssueDates from './get-issue-dates.js';
import getIssueSla from './get-issue-sla.js';

const mockJira = {
  getIssueDateFields: vi.fn(),
  getIssueSla: vi.fn(),
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

describe('get-issue-dates', () => {
  it('calls jira.getIssueDateFields with issueKey', async () => {
    const dates = { created: '2026-01-01', updated: '2026-01-02' };
    mockJira.getIssueDateFields.mockResolvedValue(dates);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueDates.handler(ctx);
    expect(mockJira.getIssueDateFields).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(dates);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getIssueDateFields.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssueDates.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-issue-sla', () => {
  it('calls jira.getIssueSla with issueKey', async () => {
    const sla = { values: [{ name: 'Time to resolution', remainingTime: { millis: 3600000 } }] };
    mockJira.getIssueSla.mockResolvedValue(sla);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssueSla.handler(ctx);
    expect(mockJira.getIssueSla).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith(sla);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getIssueSla.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssueSla.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
