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
import searchFields from './search-fields.js';
import getFieldOptions from './get-field-options.js';

const mockJira = {
  getFields: vi.fn(),
  getFieldOptions: vi.fn(),
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

describe('search-fields', () => {
  it('calls jira.getFields and returns result', async () => {
    const fields = [{ id: 'summary', name: 'Summary' }];
    mockJira.getFields.mockResolvedValue(fields);
    const ctx = makeContext();
    await searchFields.handler(ctx);
    expect(mockJira.getFields).toHaveBeenCalled();
    expect(toOutput).toHaveBeenCalledWith(fields);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getFields.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await searchFields.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-field-options', () => {
  it('calls jira.getFieldOptions with fieldId and contextId', async () => {
    const options = { values: [{ id: '1', value: 'Option A' }] };
    mockJira.getFieldOptions.mockResolvedValue(options);
    const ctx = makeContext({ fieldId: 'customfield_10001', contextId: '10100' });
    await getFieldOptions.handler(ctx);
    expect(mockJira.getFieldOptions).toHaveBeenCalledWith('customfield_10001', '10100');
    expect(toOutput).toHaveBeenCalledWith(options);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getFieldOptions.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ fieldId: 'f1', contextId: 'c1' });
    const result = await getFieldOptions.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
