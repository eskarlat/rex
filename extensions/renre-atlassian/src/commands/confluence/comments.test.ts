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
import getComments from './get-comments.js';
import addComment from './add-comment.js';
import replyToComment from './reply-to-comment.js';

const mockConfluence = {
  getComments: vi.fn(),
  addComment: vi.fn(),
  replyToComment: vi.fn(),
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

describe('get-comments', () => {
  it('should get comments with defaults', async () => {
    mockConfluence.getComments.mockResolvedValue({ results: [{ id: 'c1' }] });
    const ctx = makeContext({ pageId: '123', limit: 25, start: 0 });
    const result = await getComments.handler(ctx);
    expect(mockConfluence.getComments).toHaveBeenCalledWith('123', 25, 0);
    expect(toOutput).toHaveBeenCalledWith({ results: [{ id: 'c1' }] });
    expect(result.exitCode).toBe(0);
  });

  it('should get comments with custom limit and start', async () => {
    mockConfluence.getComments.mockResolvedValue({ results: [] });
    const ctx = makeContext({ pageId: '123', limit: 10, start: 5 });
    await getComments.handler(ctx);
    expect(mockConfluence.getComments).toHaveBeenCalledWith('123', 10, 5);
  });

  it('should handle errors', async () => {
    mockConfluence.getComments.mockRejectedValue(new Error('fail'));
    const result = await getComments.handler(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('add-comment', () => {
  it('should add a comment to a page', async () => {
    mockConfluence.addComment.mockResolvedValue({ id: 'c2', body: 'Nice work' });
    const ctx = makeContext({ pageId: '123', body: 'Nice work' });
    const result = await addComment.handler(ctx);
    expect(mockConfluence.addComment).toHaveBeenCalledWith('123', 'Nice work');
    expect(toOutput).toHaveBeenCalledWith({ id: 'c2', body: 'Nice work' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.addComment.mockRejectedValue(new Error('fail'));
    const result = await addComment.handler(makeContext({ pageId: '123', body: 'x' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('reply-to-comment', () => {
  it('should reply to an existing comment', async () => {
    mockConfluence.replyToComment.mockResolvedValue({ id: 'c3' });
    const ctx = makeContext({ pageId: '123', parentCommentId: 'c1', body: 'Thanks!' });
    const result = await replyToComment.handler(ctx);
    expect(mockConfluence.replyToComment).toHaveBeenCalledWith('123', 'c1', 'Thanks!');
    expect(toOutput).toHaveBeenCalledWith({ id: 'c3' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.replyToComment.mockRejectedValue(new Error('fail'));
    const result = await replyToComment.handler(
      makeContext({ pageId: '123', parentCommentId: 'c1', body: 'x' }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
