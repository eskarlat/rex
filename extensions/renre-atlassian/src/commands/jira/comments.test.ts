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
import addComment from './add-comment.js';
import editComment from './edit-comment.js';

const mockJira = {
  addComment: vi.fn(),
  editComment: vi.fn(),
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

const expectedAdfBody = (text: string) => ({
  type: 'doc',
  version: 1,
  content: [
    {
      type: 'paragraph',
      content: [{ type: 'text', text }],
    },
  ],
});

describe('add-comment', () => {
  it('calls jira.addComment with issueKey and ADF body', async () => {
    mockJira.addComment.mockResolvedValue({ id: '100' });
    const ctx = makeContext({ issueKey: 'TEST-1', body: 'Hello world' });
    await addComment.handler(ctx);
    expect(mockJira.addComment).toHaveBeenCalledWith('TEST-1', expectedAdfBody('Hello world'));
    expect(toOutput).toHaveBeenCalledWith({ id: '100' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.addComment.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', body: 'text' });
    const result = await addComment.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('edit-comment', () => {
  it('calls jira.editComment with issueKey, commentId, and ADF body', async () => {
    mockJira.editComment.mockResolvedValue({ id: '100' });
    const ctx = makeContext({ issueKey: 'TEST-1', commentId: '100', body: 'Updated text' });
    await editComment.handler(ctx);
    expect(mockJira.editComment).toHaveBeenCalledWith(
      'TEST-1',
      '100',
      expectedAdfBody('Updated text'),
    );
    expect(toOutput).toHaveBeenCalledWith({ id: '100' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.editComment.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', commentId: '100', body: 'text' });
    const result = await editComment.handler(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
