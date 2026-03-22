/**
 * Integration tests for all Confluence, status, and help commands.
 *
 * No mocking — each command runs the full stack:
 *   command → confluenceCommand helper → createClients → ConfluenceClient → real fetch
 *
 * Two modes:
 *   1. Missing config — always runs, verifies graceful error handling
 *   2. Live API — runs only when ATLASSIAN_* env vars are set, verifies real responses
 */
import { describe, it, expect } from 'vitest';

import { missingConfigContext, liveContext, hasCredentials, testConfig } from './test-config.js';
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

// ---------------------------------------------------------------------------
// Help commands — no API needed, always pass
// ---------------------------------------------------------------------------
describe('Help commands — no API needed', () => {
  it('jira-help returns help text', async () => {
    const result = await jiraHelp.handler(missingConfigContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('jira');
  });

  it('confluence-help returns help text', async () => {
    const result = await confluenceHelp.handler(missingConfigContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('confluence');
  });
});

// ---------------------------------------------------------------------------
// Missing config — every command must return exitCode 1 without throwing
// ---------------------------------------------------------------------------
describe('Confluence Commands — missing config', () => {
  const ctx = missingConfigContext;

  it('status returns error without throwing', async () => {
    const result = await status.handler(ctx());
    expect(result.exitCode).toBe(1);
    expect(result.output).toBeTruthy();
  });

  it('search returns error without throwing', async () => {
    const result = await search.handler(ctx({ cql: 'type=page' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page returns error without throwing', async () => {
    const result = await getPage.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-children returns error without throwing', async () => {
    const result = await getPageChildren.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-history returns error without throwing', async () => {
    const result = await getPageHistory.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('create-page returns error without throwing', async () => {
    const result = await createPage.handler(ctx({ title: 'Test', spaceKey: 'SPACE', body: '<p>hi</p>' }));
    expect(result.exitCode).toBe(1);
  });

  it('update-page returns error without throwing', async () => {
    const result = await updatePage.handler(
      ctx({ pageId: '12345', title: 'Updated', body: '<p>new</p>', version: 2 }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('delete-page returns error without throwing', async () => {
    const result = await deletePage.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('move-page returns error without throwing', async () => {
    const result = await movePage.handler(
      ctx({ pageId: '12345', targetAncestorId: '99', currentVersion: 3 }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-page-diff returns error without throwing', async () => {
    const result = await getPageDiff.handler(ctx({ pageId: '12345', fromVersion: 1, toVersion: 2 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-comments returns error without throwing', async () => {
    const result = await getComments.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-comment returns error without throwing', async () => {
    const result = await addComment.handler(ctx({ pageId: '12345', body: 'A comment' }));
    expect(result.exitCode).toBe(1);
  });

  it('reply-to-comment returns error without throwing', async () => {
    const result = await replyToComment.handler(
      ctx({ pageId: '12345', parentCommentId: '100', body: 'Reply' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-labels returns error without throwing', async () => {
    const result = await getLabels.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-label returns error without throwing', async () => {
    const result = await addLabel.handler(ctx({ pageId: '12345', labels: ['label1'] }));
    expect(result.exitCode).toBe(1);
  });

  it('search-user returns error without throwing', async () => {
    const result = await searchUser.handler(ctx({ query: 'john' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-views returns error without throwing', async () => {
    const result = await getPageViews.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('upload-attachment returns error without throwing', async () => {
    const result = await uploadAttachment.handler(
      ctx({ pageId: '12345', filename: 'test.txt', content: 'hello' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('upload-attachments returns error without throwing', async () => {
    const result = await uploadAttachments.handler(
      ctx({ pageId: '12345', files: [{ filename: 'a.txt', content: 'aa' }] }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-attachments returns error without throwing', async () => {
    const result = await getAttachments.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('download-attachment returns error without throwing', async () => {
    const result = await downloadAttachment.handler(ctx({ pageId: '12345', filename: 'test.txt' }));
    expect(result.exitCode).toBe(1);
  });

  it('download-all-attachments returns error without throwing', async () => {
    const result = await downloadAllAttachments.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('delete-attachment returns error without throwing', async () => {
    const result = await deleteAttachment.handler(ctx({ attachmentId: 'att-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-images returns error without throwing', async () => {
    const result = await getPageImages.handler(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Live API — only runs when ATLASSIAN_* env vars are set
// ---------------------------------------------------------------------------
describe.skipIf(!hasCredentials)('Confluence Commands — live API', { timeout: 30_000 }, () => {
  const ctx = liveContext;

  it('status returns connection info', async () => {
    const result = await status.handler(ctx());
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeTruthy();
  });

  it('search returns results', async () => {
    const result = await search.handler(ctx({ cql: 'type=page', limit: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-page returns page content', async () => {
    const result = await getPage.handler(ctx({ pageId: testConfig.pageId }));
    expect(result.exitCode).toBe(0);
  });

  it('get-page-children returns children', async () => {
    const result = await getPageChildren.handler(ctx({ pageId: testConfig.pageId, limit: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-page-history returns history', async () => {
    const result = await getPageHistory.handler(ctx({ pageId: testConfig.pageId }));
    expect(result.exitCode).toBe(0);
  });

  it('get-comments returns comments', async () => {
    const result = await getComments.handler(ctx({ pageId: testConfig.pageId, limit: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-labels returns labels', async () => {
    const result = await getLabels.handler(ctx({ pageId: testConfig.pageId }));
    expect(result.exitCode).toBe(0);
  });

  it('get-attachments returns attachments', async () => {
    const result = await getAttachments.handler(ctx({ pageId: testConfig.pageId, limit: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-page-images returns images', async () => {
    const result = await getPageImages.handler(ctx({ pageId: testConfig.pageId }));
    expect(result.exitCode).toBe(0);
  });

  it('download-all-attachments returns list', async () => {
    const result = await downloadAllAttachments.handler(ctx({ pageId: testConfig.pageId }));
    expect(result.exitCode).toBe(0);
  });
});
