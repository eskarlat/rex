import { describe, it, expect, vi, beforeEach } from 'vitest';

import type { ExecutionContext } from '../shared/types.js';
import getIssue from '../commands/jira/get-issue.js';
import search from '../commands/jira/search.js';
import getProjectIssues from '../commands/jira/get-project-issues.js';
import createIssue from '../commands/jira/create-issue.js';
import updateIssue from '../commands/jira/update-issue.js';
import deleteIssue from '../commands/jira/delete-issue.js';
import batchCreateIssues from '../commands/jira/batch-create-issues.js';
import getChangelogs from '../commands/jira/get-changelogs.js';
import searchFields from '../commands/jira/search-fields.js';
import getFieldOptions from '../commands/jira/get-field-options.js';
import addComment from '../commands/jira/add-comment.js';
import editComment from '../commands/jira/edit-comment.js';
import getTransitions from '../commands/jira/get-transitions.js';
import transitionIssue from '../commands/jira/transition-issue.js';
import getAllProjects from '../commands/jira/get-all-projects.js';
import getProjectVersions from '../commands/jira/get-project-versions.js';
import getProjectComponents from '../commands/jira/get-project-components.js';
import createVersion from '../commands/jira/create-version.js';
import batchCreateVersions from '../commands/jira/batch-create-versions.js';
import getAgileBoards from '../commands/jira/get-agile-boards.js';
import getBoardIssues from '../commands/jira/get-board-issues.js';
import getSprintsFromBoard from '../commands/jira/get-sprints-from-board.js';
import getSprintIssues from '../commands/jira/get-sprint-issues.js';
import createSprint from '../commands/jira/create-sprint.js';
import updateSprint from '../commands/jira/update-sprint.js';
import addIssuesToSprint from '../commands/jira/add-issues-to-sprint.js';
import createIssueLink from '../commands/jira/create-issue-link.js';
import getLinkTypes from '../commands/jira/get-link-types.js';
import linkToEpic from '../commands/jira/link-to-epic.js';
import createRemoteIssueLink from '../commands/jira/create-remote-issue-link.js';
import removeIssueLink from '../commands/jira/remove-issue-link.js';
import getWorklog from '../commands/jira/get-worklog.js';
import addWorklog from '../commands/jira/add-worklog.js';
import downloadAttachment from '../commands/jira/download-attachment.js';
import getIssueImages from '../commands/jira/get-issue-images.js';
import getUserProfile from '../commands/jira/get-user-profile.js';
import getIssueWatchers from '../commands/jira/get-issue-watchers.js';
import addWatcher from '../commands/jira/add-watcher.js';
import removeWatcher from '../commands/jira/remove-watcher.js';
import getServiceDesks from '../commands/jira/get-service-desks.js';
import getServiceDeskQueues from '../commands/jira/get-service-desk-queues.js';
import getQueueIssues from '../commands/jira/get-queue-issues.js';
import getIssueForms from '../commands/jira/get-issue-forms.js';
import getFormDetails from '../commands/jira/get-form-details.js';
import updateFormAnswers from '../commands/jira/update-form-answers.js';
import getIssueDates from '../commands/jira/get-issue-dates.js';
import getIssueSla from '../commands/jira/get-issue-sla.js';
import getDevInfo from '../commands/jira/get-dev-info.js';
import getDevSummary from '../commands/jira/get-dev-summary.js';
import getBatchDevInfo from '../commands/jira/get-batch-dev-info.js';

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
    headers: new Headers(),
  } as unknown as Response;
}

describe('Jira Commands Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe('get-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ key: 'TEST-1', fields: {} }));
      const result = await getIssue(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  describe('search', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issues: [], total: 0 }));
      const result = await search(makeContext({ jql: 'project=TEST', startAt: 0, maxResults: 10 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-project-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issues: [], total: 0 }));
      const result = await getProjectIssues(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ key: 'TEST-2', id: '10001' }));
      const result = await createIssue(makeContext({ projectKey: 'TEST', issueType: 'Task', summary: 'Test issue' }));
      expect(result.exitCode).toBe(0);
    });

    it('should handle description with ADF body', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ key: 'TEST-3', id: '10002' }));
      const result = await createIssue(
        makeContext({ projectKey: 'TEST', issueType: 'Bug', summary: 'Bug', description: 'Description text' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('update-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await updateIssue(makeContext({ issueKey: 'TEST-1', fields: { summary: 'Updated' } }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('delete-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await deleteIssue(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('batch-create-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issues: [{ key: 'TEST-4' }] }));
      const result = await batchCreateIssues(makeContext({ issues: [{ fields: { summary: 'Batch' } }] }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-changelogs', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [], total: 0 }));
      const result = await getChangelogs(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('search-fields', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse([{ id: 'summary', name: 'Summary' }]));
      const result = await searchFields(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-field-options', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getFieldOptions(makeContext({ fieldId: 'cf_10001', contextId: '10000' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '10000', body: {} }));
      const result = await addComment(makeContext({ issueKey: 'TEST-1', body: 'hello' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('edit-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '10000', body: {} }));
      const result = await editComment(makeContext({ issueKey: 'TEST-1', commentId: '10000', body: 'updated' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-transitions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ transitions: [] }));
      const result = await getTransitions(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('transition-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await transitionIssue(makeContext({ issueKey: 'TEST-1', transitionId: '31' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-all-projects', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse([{ key: 'TEST', name: 'Test Project' }]));
      const result = await getAllProjects(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-project-versions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse([{ id: '1', name: 'v1.0' }]));
      const result = await getProjectVersions(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-project-components', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse([{ id: '1', name: 'Backend' }]));
      const result = await getProjectComponents(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-version', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '1', name: 'v1.0' }));
      const result = await createVersion(makeContext({ projectKey: 'TEST', name: 'v1.0' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('batch-create-versions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '1', name: 'v1' }));
      const result = await batchCreateVersions(
        makeContext({ projectKey: 'TEST', versions: [{ name: 'v1' }, { name: 'v2' }] }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-agile-boards', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getAgileBoards(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-board-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issues: [] }));
      const result = await getBoardIssues(makeContext({ boardId: 1 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-sprints-from-board', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getSprintsFromBoard(makeContext({ boardId: 1 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-sprint-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issues: [] }));
      const result = await getSprintIssues(makeContext({ sprintId: 1 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: 1, name: 'Sprint 1' }));
      const result = await createSprint(makeContext({ boardId: 1, name: 'Sprint 1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('update-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: 1, name: 'Updated Sprint' }));
      const result = await updateSprint(makeContext({ sprintId: 1, name: 'Updated Sprint' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-issues-to-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await addIssuesToSprint(makeContext({ sprintId: 1, issueKeys: ['TEST-1'] }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await createIssueLink(
        makeContext({ typeName: 'Blocks', inwardIssueKey: 'TEST-1', outwardIssueKey: 'TEST-2' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-link-types', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ issueLinkTypes: [] }));
      const result = await getLinkTypes(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('link-to-epic', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await linkToEpic(makeContext({ epicKey: 'TEST-1', issueKeys: ['TEST-2'] }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('create-remote-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: 1 }));
      const result = await createRemoteIssueLink(
        makeContext({ issueKey: 'TEST-1', url: 'https://example.com', title: 'Link' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('remove-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await removeIssueLink(makeContext({ linkId: '10000' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-worklog', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ worklogs: [] }));
      const result = await getWorklog(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-worklog', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '1', timeSpent: '2h' }));
      const result = await addWorklog(makeContext({ issueKey: 'TEST-1', timeSpent: '2h' }));
      expect(result.exitCode).toBe(0);
    });

    it('should handle comment with ADF body', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ id: '1', timeSpent: '1h' }));
      const result = await addWorklog(
        makeContext({ issueKey: 'TEST-1', timeSpent: '1h', comment: 'Did work' }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('download-attachment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse('file content here'),
      );
      const result = await downloadAttachment(makeContext({ attachmentId: '10000' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toContain('content');
    });
  });

  describe('get-issue-images', () => {
    it('should complete without error and filter images', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          attachments: [
            { mimeType: 'image/png', filename: 'screenshot.png' },
            { mimeType: 'application/pdf', filename: 'doc.pdf' },
            { mimeType: 'image/jpeg', filename: 'photo.jpg' },
          ],
        }),
      );
      const result = await getIssueImages(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-user-profile', () => {
    it('should get own profile without accountId', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ accountId: 'self', displayName: 'Test User' }),
      );
      const result = await getUserProfile(makeContext());
      expect(result.exitCode).toBe(0);
    });

    it('should get specific user with accountId', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ accountId: '123', displayName: 'Other User' }),
      );
      const result = await getUserProfile(makeContext({ accountId: '123' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-issue-watchers', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ watchers: [] }));
      const result = await getIssueWatchers(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('add-watcher', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await addWatcher(makeContext({ issueKey: 'TEST-1', accountId: '123' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('remove-watcher', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await removeWatcher(makeContext({ issueKey: 'TEST-1', accountId: '123' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-service-desks', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getServiceDesks(makeContext());
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-service-desk-queues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getServiceDeskQueues(makeContext({ serviceDeskId: 1 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-queue-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ values: [] }));
      const result = await getQueueIssues(makeContext({ serviceDeskId: 1, queueId: 1 }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-issue-forms', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse([]));
      const result = await getIssueForms(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-form-details', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ formId: 'form-1', fields: [] }));
      const result = await getFormDetails(makeContext({ issueKey: 'TEST-1', formId: 'form-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('update-form-answers', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ success: true }));
      const result = await updateFormAnswers(
        makeContext({ issueKey: 'TEST-1', formId: 'form-1', answers: { q1: 'a1' } }),
      );
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-issue-dates', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ created: '2024-01-01', updated: '2024-01-02' }));
      const result = await getIssueDates(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-issue-sla', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ sla: [] }));
      const result = await getIssueSla(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-dev-info', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ detail: [] }));
      const result = await getDevInfo(makeContext({ issueId: '10001' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-dev-summary', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ summary: {} }));
      const result = await getDevSummary(makeContext({ issueId: '10001' }));
      expect(result.exitCode).toBe(0);
    });
  });

  describe('get-batch-dev-info', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mockFetchResponse({ details: [] }));
      const result = await getBatchDevInfo(makeContext({ issueIds: ['10001', '10002'] }));
      expect(result.exitCode).toBe(0);
    });
  });
});
