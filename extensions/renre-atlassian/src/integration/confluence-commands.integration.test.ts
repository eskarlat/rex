import { describe, it, expect, vi, beforeEach } from 'vitest';

import search from '../commands/confluence/search.js';
import getPage from '../commands/confluence/get-page.js';
import getPageChildren from '../commands/confluence/get-page-children.js';
import getPageHistory from '../commands/confluence/get-page-history.js';
import createPage from '../commands/confluence/create-page.js';
import updatePage from '../commands/confluence/update-page.js';
import deletePage from '../commands/confluence/delete-page.js';
import movePage from '../commands/confluence/move-page.js';
import getPageDiff from '../commands/confluence/get-page-diff.js';
import getComments from '../commands/confluence/get-comments.js';
import addComment from '../commands/confluence/add-comment.js';
import replyToComment from '../commands/confluence/reply-to-comment.js';
import getLabels from '../commands/confluence/get-labels.js';
import addLabel from '../commands/confluence/add-label.js';
import searchUser from '../commands/confluence/search-user.js';
import getPageViews from '../commands/confluence/get-page-views.js';
import uploadAttachment from '../commands/confluence/upload-attachment.js';
import uploadAttachments from '../commands/confluence/upload-attachments.js';
import getAttachments from '../commands/confluence/get-attachments.js';
import downloadAttachment from '../commands/confluence/download-attachment.js';
import downloadAllAttachments from '../commands/confluence/download-all-attachments.js';
import deleteAttachment from '../commands/confluence/delete-attachment.js';
import getPageImages from '../commands/confluence/get-page-images.js';
import status from '../commands/status.js';
import jiraHelp from '../commands/jira-help.js';
import confluenceHelp from '../commands/confluence-help.js';
import type { ExecutionContext } from '../shared/types.js';

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test-project',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'test-token' },
  };
}

function mockFetchResponse(data: unknown, status = 200): Response {
  return {
    ok: true,
    status,
    json: () => Promise.resolve(data),
    text: () => Promise.resolve(typeof data === 'string' ? data : JSON.stringify(data)),
    headers: new Headers({ 'content-type': 'application/json' }),
  } as unknown as Response;
}

function mock204Response(): Response {
  return {
    ok: true,
    status: 204,
    json: () => Promise.resolve(undefined),
    text: () => Promise.resolve(''),
  } as unknown as Response;
}

describe('Confluence Commands Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // --- Pages ---

  describe('search', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await search(makeContext({ cql: 'type=page' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('search with pagination', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await search(makeContext({ cql: 'type=page', limit: 10, start: 5 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '12345', title: 'Test Page', body: { storage: { value: '<p>hello</p>' } } }),
      );
      const result = await getPage(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page with expand', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '12345', title: 'Test Page', body: { view: { value: '<p>hello</p>' } } }),
      );
      const result = await getPage(makeContext({ pageId: '12345', expand: 'body.view' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page-children', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await getPageChildren(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page-history', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ lastUpdated: { when: '2024-01-01' } }),
      );
      const result = await getPageHistory(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-page', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '99999', title: 'Test', type: 'page' }),
      );
      const result = await createPage(
        makeContext({ title: 'Test', spaceKey: 'SPACE', body: '<p>hello</p>' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-page with parent', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '99999', title: 'Test', type: 'page' }),
      );
      const result = await createPage(
        makeContext({ title: 'Test', spaceKey: 'SPACE', body: '<p>hello</p>', parentId: '99' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('update-page', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '12345', title: 'Updated', version: { number: 3 } }),
      );
      const result = await updatePage(
        makeContext({ pageId: '12345', title: 'Updated', body: '<p>new</p>', version: 2 }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('delete-page', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await deletePage(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('move-page', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '12345', ancestors: [{ id: '99' }] }),
      );
      const result = await movePage(
        makeContext({ pageId: '12345', targetAncestorId: '99', currentVersion: 3 }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page-diff', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          id: '12345',
          body: { storage: { value: '<p>version content</p>' } },
        }),
      );
      const result = await getPageDiff(
        makeContext({ pageId: '12345', fromVersion: 1, toVersion: 2 }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Comments ---

  describe('get-comments', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await getComments(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '200', type: 'comment' }),
      );
      const result = await addComment(makeContext({ pageId: '12345', body: 'A comment' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('reply-to-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '201', type: 'comment' }),
      );
      const result = await replyToComment(
        makeContext({ pageId: '12345', parentCommentId: '100', body: 'Reply' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Labels ---

  describe('get-labels', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await getLabels(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-label', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse([{ name: 'label1' }, { name: 'label2' }]),
      );
      const result = await addLabel(
        makeContext({ pageId: '12345', labels: ['label1', 'label2'] }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Users ---

  describe('search-user', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await searchUser(makeContext({ query: 'john' }));
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Analytics ---

  describe('get-page-views', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ count: 42 }));
      const result = await getPageViews(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page-views with fromDate', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ count: 10 }));
      const result = await getPageViews(
        makeContext({ pageId: '12345', fromDate: '2024-01-01' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Attachments ---

  describe('upload-attachment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ results: [{ id: 'att-1', title: 'test.txt' }] }),
      );
      const result = await uploadAttachment(
        makeContext({ pageId: '12345', filename: 'test.txt', content: 'hello' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('upload-attachments', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ results: [{ id: 'att-1', title: 'a.txt' }] }),
      );
      const result = await uploadAttachments(
        makeContext({ pageId: '12345', files: [{ filename: 'a.txt', content: 'aa' }] }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-attachments', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await getAttachments(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('download-attachment', () => {
    it('should complete without error', async () => {
      const fetchSpy = vi.spyOn(global, 'fetch');
      // First call: getAttachments (to find the attachment by filename)
      fetchSpy.mockResolvedValueOnce(
        mockFetchResponse({
          results: [{ id: 'att-1', title: 'test.txt' }],
        }),
      );
      // Second call: requestRaw to download the attachment content
      fetchSpy.mockResolvedValueOnce({
        ok: true,
        status: 200,
        text: () => Promise.resolve('file content here'),
        headers: new Headers({ 'content-type': 'application/octet-stream' }),
      } as unknown as Response);
      const result = await downloadAttachment(
        makeContext({ pageId: '12345', filename: 'test.txt' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('download-all-attachments', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await downloadAllAttachments(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('delete-attachment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await deleteAttachment(makeContext({ attachmentId: 'att-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-page-images', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ results: [] }));
      const result = await getPageImages(makeContext({ pageId: '12345' }));
      expect(result.exitCode).toBe(0);
    });
  });

  // --- Status and Help ---

  describe('status', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ accountId: 'abc', displayName: 'Test User', emailAddress: 'test@test.com' }),
      );
      const result = await status(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('jira-help', () => {
    it('should complete without error', () => {
      const result = jiraHelp(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('confluence-help', () => {
    it('should complete without error', () => {
      const result = confluenceHelp(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });
});
