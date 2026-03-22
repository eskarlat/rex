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
import search from './search.js';
import getPage from './get-page.js';
import getPageChildren from './get-page-children.js';
import getPageHistory from './get-page-history.js';
import createPage from './create-page.js';
import updatePage from './update-page.js';
import deletePage from './delete-page.js';
import movePage from './move-page.js';
import getPageDiff from './get-page-diff.js';

const mockConfluence = {
  search: vi.fn(),
  getPage: vi.fn(),
  getPageChildren: vi.fn(),
  getPageHistory: vi.fn(),
  createPage: vi.fn(),
  updatePage: vi.fn(),
  deletePage: vi.fn(),
  movePage: vi.fn(),
  getPageVersion: vi.fn(),
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

describe('search', () => {
  it('should search with cql, limit, and start', async () => {
    mockConfluence.search.mockResolvedValue({ results: [] });
    const ctx = makeContext({ cql: 'type = page', limit: 10, start: 5 });
    const result = await search.handler(ctx);
    expect(mockConfluence.search).toHaveBeenCalledWith('type = page', 10, 5);
    expect(toOutput).toHaveBeenCalledWith({ results: [] });
    expect(result.exitCode).toBe(0);
  });

  it('should use default limit and start', async () => {
    mockConfluence.search.mockResolvedValue({ results: [] });
    const ctx = makeContext({ cql: 'type = page', limit: 25, start: 0 });
    await search.handler(ctx);
    expect(mockConfluence.search).toHaveBeenCalledWith('type = page', 25, 0);
  });

  it('should handle errors', async () => {
    mockConfluence.search.mockRejectedValue(new Error('Search failed'));
    const result = await search.handler(makeContext({ cql: 'bad' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-page', () => {
  it('should get page with default expand', async () => {
    mockConfluence.getPage.mockResolvedValue({ id: '123', title: 'Test' });
    const ctx = makeContext({ pageId: '123', expand: 'body.storage,version' });
    const result = await getPage.handler(ctx);
    expect(mockConfluence.getPage).toHaveBeenCalledWith('123', 'body.storage,version');
    expect(toOutput).toHaveBeenCalledWith({ id: '123', title: 'Test' });
    expect(result.exitCode).toBe(0);
  });

  it('should get page with custom expand', async () => {
    mockConfluence.getPage.mockResolvedValue({ id: '123' });
    const ctx = makeContext({ pageId: '123', expand: 'version' });
    await getPage.handler(ctx);
    expect(mockConfluence.getPage).toHaveBeenCalledWith('123', 'version');
  });

  it('should handle errors', async () => {
    mockConfluence.getPage.mockRejectedValue(new Error('Not found'));
    const result = await getPage.handler(makeContext({ pageId: '999' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-page-children', () => {
  it('should get children with defaults', async () => {
    mockConfluence.getPageChildren.mockResolvedValue({ results: [] });
    const ctx = makeContext({ pageId: '123', limit: 25, start: 0 });
    await getPageChildren.handler(ctx);
    expect(mockConfluence.getPageChildren).toHaveBeenCalledWith('123', 25, 0);
  });

  it('should get children with custom limit and start', async () => {
    mockConfluence.getPageChildren.mockResolvedValue({ results: [] });
    const ctx = makeContext({ pageId: '123', limit: 10, start: 5 });
    await getPageChildren.handler(ctx);
    expect(mockConfluence.getPageChildren).toHaveBeenCalledWith('123', 10, 5);
  });

  it('should handle errors', async () => {
    mockConfluence.getPageChildren.mockRejectedValue(new Error('fail'));
    const result = await getPageChildren.handler(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-page-history', () => {
  it('should get page history', async () => {
    mockConfluence.getPageHistory.mockResolvedValue({ results: [{ number: 1 }] });
    const ctx = makeContext({ pageId: '123' });
    const result = await getPageHistory.handler(ctx);
    expect(mockConfluence.getPageHistory).toHaveBeenCalledWith('123');
    expect(toOutput).toHaveBeenCalledWith({ results: [{ number: 1 }] });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getPageHistory.mockRejectedValue(new Error('fail'));
    const result = await getPageHistory.handler(makeContext({ pageId: '123' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('create-page', () => {
  it('should create a page without parentId', async () => {
    mockConfluence.createPage.mockResolvedValue({ id: '456', title: 'New Page' });
    const ctx = makeContext({ title: 'New Page', spaceKey: 'DEV', body: '<p>Hello</p>' });
    const result = await createPage.handler(ctx);
    expect(mockConfluence.createPage).toHaveBeenCalledWith({
      type: 'page',
      title: 'New Page',
      space: { key: 'DEV' },
      body: { storage: { value: '<p>Hello</p>', representation: 'storage' } },
    });
    expect(toOutput).toHaveBeenCalledWith({ id: '456', title: 'New Page' });
    expect(result.exitCode).toBe(0);
  });

  it('should create a page with parentId', async () => {
    mockConfluence.createPage.mockResolvedValue({ id: '456' });
    const ctx = makeContext({
      title: 'Child Page',
      spaceKey: 'DEV',
      body: '<p>Child</p>',
      parentId: '123',
    });
    await createPage.handler(ctx);
    expect(mockConfluence.createPage).toHaveBeenCalledWith({
      type: 'page',
      title: 'Child Page',
      space: { key: 'DEV' },
      body: { storage: { value: '<p>Child</p>', representation: 'storage' } },
      ancestors: [{ id: '123' }],
    });
  });

  it('should handle errors', async () => {
    mockConfluence.createPage.mockRejectedValue(new Error('Permission denied'));
    const result = await createPage.handler(
      makeContext({ title: 'X', spaceKey: 'DEV', body: '<p>X</p>' }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('update-page', () => {
  it('should update a page with incremented version', async () => {
    mockConfluence.updatePage.mockResolvedValue({ id: '123', title: 'Updated' });
    const ctx = makeContext({
      pageId: '123',
      title: 'Updated',
      body: '<p>Updated content</p>',
      version: 5,
    });
    const result = await updatePage.handler(ctx);
    expect(mockConfluence.updatePage).toHaveBeenCalledWith('123', {
      type: 'page',
      title: 'Updated',
      body: { storage: { value: '<p>Updated content</p>', representation: 'storage' } },
      version: { number: 6 },
    });
    expect(toOutput).toHaveBeenCalledWith({ id: '123', title: 'Updated' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.updatePage.mockRejectedValue(new Error('Conflict'));
    const result = await updatePage.handler(
      makeContext({ pageId: '123', title: 'X', body: '<p>X</p>', version: 1 }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('delete-page', () => {
  it('should delete a page', async () => {
    mockConfluence.deletePage.mockResolvedValue(undefined);
    const ctx = makeContext({ pageId: '123' });
    const result = await deletePage.handler(ctx);
    expect(mockConfluence.deletePage).toHaveBeenCalledWith('123');
    expect(toOutput).toHaveBeenCalledWith({ success: true, pageId: '123' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.deletePage.mockRejectedValue(new Error('Not found'));
    const result = await deletePage.handler(makeContext({ pageId: '999' }));
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('move-page', () => {
  it('should move a page', async () => {
    mockConfluence.movePage.mockResolvedValue({ id: '123' });
    const ctx = makeContext({ pageId: '123', targetAncestorId: '456', currentVersion: 3 });
    const result = await movePage.handler(ctx);
    expect(mockConfluence.movePage).toHaveBeenCalledWith('123', '456', 3);
    expect(toOutput).toHaveBeenCalledWith({ id: '123' });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.movePage.mockRejectedValue(new Error('fail'));
    const result = await movePage.handler(
      makeContext({ pageId: '123', targetAncestorId: '456', currentVersion: 1 }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-page-diff', () => {
  it('should fetch two versions in parallel and return diff', async () => {
    const fromPage = { body: { storage: { value: '<p>Old content</p>' } } };
    const toPage = { body: { storage: { value: '<p>New content</p>' } } };
    mockConfluence.getPageVersion.mockImplementation(
      (_pageId: string, version: number) =>
        version === 1 ? Promise.resolve(fromPage) : Promise.resolve(toPage),
    );

    const ctx = makeContext({ pageId: '123', fromVersion: 1, toVersion: 2 });
    const result = await getPageDiff.handler(ctx);

    expect(mockConfluence.getPageVersion).toHaveBeenCalledTimes(2);
    expect(mockConfluence.getPageVersion).toHaveBeenCalledWith('123', 1);
    expect(mockConfluence.getPageVersion).toHaveBeenCalledWith('123', 2);
    expect(toOutput).toHaveBeenCalledWith({
      pageId: '123',
      fromVersion: 1,
      toVersion: 2,
      from: '<p>Old content</p>',
      to: '<p>New content</p>',
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle missing body gracefully', async () => {
    mockConfluence.getPageVersion.mockResolvedValue({});
    const ctx = makeContext({ pageId: '123', fromVersion: 1, toVersion: 2 });
    const result = await getPageDiff.handler(ctx);
    expect(toOutput).toHaveBeenCalledWith({
      pageId: '123',
      fromVersion: 1,
      toVersion: 2,
      from: '',
      to: '',
    });
    expect(result.exitCode).toBe(0);
  });

  it('should handle errors', async () => {
    mockConfluence.getPageVersion.mockRejectedValue(new Error('Version not found'));
    const result = await getPageDiff.handler(
      makeContext({ pageId: '123', fromVersion: 1, toVersion: 99 }),
    );
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
