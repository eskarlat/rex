/**
 * Integration tests for all Confluence, status, and help commands.
 *
 * No mocking — each command runs the full stack:
 *   command → confluenceCommand helper → createClients → ConfluenceClient → real fetch
 *
 * Without valid credentials the API call will fail, but the command must
 * handle the error gracefully: return { exitCode: 1, output: '...' }
 * and never throw.
 *
 * Help commands need no API access and should return exitCode: 0.
 */
import { describe, it, expect } from 'vitest';

import type { ExecutionContext } from '../shared/types.js';
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

/** Context with missing config — should trigger config validation error */
function missingConfigContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: {},
  };
}


describe('Help commands — no API needed', () => {
  it('jira-help returns help text', async () => {
    const result = await jiraHelp(missingConfigContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('jira');
  });

  it('confluence-help returns help text', async () => {
    const result = await confluenceHelp(missingConfigContext());
    expect(result.exitCode).toBe(0);
    expect(result.output).toContain('confluence');
  });
});

describe('Confluence Commands Integration — missing config', () => {
  const ctx = missingConfigContext;

  it('status returns error without throwing', async () => {
    const result = await status(ctx());
    expect(result.exitCode).toBe(1);
    expect(result.output).toBeTruthy();
  });

  it('search returns error without throwing', async () => {
    const result = await search(ctx({ cql: 'type=page' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page returns error without throwing', async () => {
    const result = await getPage(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-children returns error without throwing', async () => {
    const result = await getPageChildren(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-history returns error without throwing', async () => {
    const result = await getPageHistory(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('create-page returns error without throwing', async () => {
    const result = await createPage(ctx({ title: 'Test', spaceKey: 'SPACE', body: '<p>hi</p>' }));
    expect(result.exitCode).toBe(1);
  });

  it('update-page returns error without throwing', async () => {
    const result = await updatePage(
      ctx({ pageId: '12345', title: 'Updated', body: '<p>new</p>', version: 2 }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('delete-page returns error without throwing', async () => {
    const result = await deletePage(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('move-page returns error without throwing', async () => {
    const result = await movePage(
      ctx({ pageId: '12345', targetAncestorId: '99', currentVersion: 3 }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-page-diff returns error without throwing', async () => {
    const result = await getPageDiff(ctx({ pageId: '12345', fromVersion: 1, toVersion: 2 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-comments returns error without throwing', async () => {
    const result = await getComments(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-comment returns error without throwing', async () => {
    const result = await addComment(ctx({ pageId: '12345', body: 'A comment' }));
    expect(result.exitCode).toBe(1);
  });

  it('reply-to-comment returns error without throwing', async () => {
    const result = await replyToComment(
      ctx({ pageId: '12345', parentCommentId: '100', body: 'Reply' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-labels returns error without throwing', async () => {
    const result = await getLabels(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-label returns error without throwing', async () => {
    const result = await addLabel(ctx({ pageId: '12345', labels: ['label1'] }));
    expect(result.exitCode).toBe(1);
  });

  it('search-user returns error without throwing', async () => {
    const result = await searchUser(ctx({ query: 'john' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-views returns error without throwing', async () => {
    const result = await getPageViews(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('upload-attachment returns error without throwing', async () => {
    const result = await uploadAttachment(
      ctx({ pageId: '12345', filename: 'test.txt', content: 'hello' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('upload-attachments returns error without throwing', async () => {
    const result = await uploadAttachments(
      ctx({ pageId: '12345', files: [{ filename: 'a.txt', content: 'aa' }] }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-attachments returns error without throwing', async () => {
    const result = await getAttachments(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('download-attachment returns error without throwing', async () => {
    const result = await downloadAttachment(ctx({ pageId: '12345', filename: 'test.txt' }));
    expect(result.exitCode).toBe(1);
  });

  it('download-all-attachments returns error without throwing', async () => {
    const result = await downloadAllAttachments(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });

  it('delete-attachment returns error without throwing', async () => {
    const result = await deleteAttachment(ctx({ attachmentId: 'att-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-page-images returns error without throwing', async () => {
    const result = await getPageImages(ctx({ pageId: '12345' }));
    expect(result.exitCode).toBe(1);
  });
});

