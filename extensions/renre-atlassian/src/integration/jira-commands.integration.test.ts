import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('Jira Commands Integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  // 1. get-issue
  describe('get-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ key: 'TEST-1', fields: { summary: 'Test issue' } }),
      );
      const result = await getIssue(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 2. search
  describe('search', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ issues: [], total: 0, startAt: 0, maxResults: 10 }),
      );
      const result = await search(
        makeContext({ jql: 'project=TEST', startAt: 0, maxResults: 10 }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 3. get-project-issues
  describe('get-project-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ issues: [], total: 0 }),
      );
      const result = await getProjectIssues(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 4. create-issue
  describe('create-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10001', key: 'TEST-2', self: 'https://test.atlassian.net/rest/api/3/issue/10001' }),
      );
      const result = await createIssue(
        makeContext({ projectKey: 'TEST', issueType: 'Task', summary: 'Test' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 5. create-issue with description
  describe('create-issue with description', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10002', key: 'TEST-3', self: 'https://test.atlassian.net/rest/api/3/issue/10002' }),
      );
      const result = await createIssue(
        makeContext({
          projectKey: 'TEST',
          issueType: 'Task',
          summary: 'Test',
          description: 'Desc',
        }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 6. update-issue
  describe('update-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await updateIssue(
        makeContext({ issueKey: 'TEST-1', fields: { summary: 'Updated' } }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 7. delete-issue
  describe('delete-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await deleteIssue(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 8. batch-create-issues
  describe('batch-create-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ issues: [{ id: '10001', key: 'TEST-1' }], errors: [] }),
      );
      const result = await batchCreateIssues(
        makeContext({ issues: [{ fields: { summary: 'A' } }] }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 9. get-changelogs
  describe('get-changelogs', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [], startAt: 0, maxResults: 100, total: 0 }),
      );
      const result = await getChangelogs(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 10. search-fields
  describe('search-fields', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse([{ id: 'summary', name: 'Summary', schema: {} }]),
      );
      const result = await searchFields(makeContext());
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 11. get-field-options
  describe('get-field-options', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [{ id: '1', value: 'Option A' }] }),
      );
      const result = await getFieldOptions(
        makeContext({ fieldId: 'cf_10001', contextId: '10000' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 12. add-comment
  describe('add-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10000', body: {}, author: {} }),
      );
      const result = await addComment(makeContext({ issueKey: 'TEST-1', body: 'hello' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 13. edit-comment
  describe('edit-comment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10000', body: {}, author: {} }),
      );
      const result = await editComment(
        makeContext({ issueKey: 'TEST-1', commentId: '10000', body: 'updated' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 14. get-transitions
  describe('get-transitions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ transitions: [{ id: '31', name: 'Done' }] }),
      );
      const result = await getTransitions(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 15. transition-issue
  describe('transition-issue', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await transitionIssue(
        makeContext({ issueKey: 'TEST-1', transitionId: '31' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 16. get-all-projects
  describe('get-all-projects', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse([{ id: '10000', key: 'TEST', name: 'Test Project' }]),
      );
      const result = await getAllProjects(makeContext());
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 17. get-project-versions
  describe('get-project-versions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse([{ id: '10000', name: 'v1.0' }]),
      );
      const result = await getProjectVersions(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 18. get-project-components
  describe('get-project-components', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse([{ id: '10000', name: 'Backend' }]),
      );
      const result = await getProjectComponents(makeContext({ projectKey: 'TEST' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 19. create-version
  describe('create-version', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10000', name: 'v1.0', project: 'TEST' }),
      );
      const result = await createVersion(makeContext({ projectKey: 'TEST', name: 'v1.0' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 20. batch-create-versions
  describe('batch-create-versions', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10000', name: 'v1', project: 'TEST' }),
      );
      const result = await batchCreateVersions(
        makeContext({ projectKey: 'TEST', versions: [{ name: 'v1' }, { name: 'v2' }] }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 21. get-agile-boards
  describe('get-agile-boards', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [{ id: 1, name: 'Board 1' }], total: 1 }),
      );
      const result = await getAgileBoards(makeContext());
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 22. get-board-issues
  describe('get-board-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ issues: [], total: 0 }),
      );
      const result = await getBoardIssues(makeContext({ boardId: 1 }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 23. get-sprints-from-board
  describe('get-sprints-from-board', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [{ id: 1, name: 'Sprint 1', state: 'active' }] }),
      );
      const result = await getSprintsFromBoard(makeContext({ boardId: 1 }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 24. get-sprint-issues
  describe('get-sprint-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ issues: [], total: 0 }),
      );
      const result = await getSprintIssues(makeContext({ sprintId: 1 }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 25. create-sprint
  describe('create-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: 1, name: 'Sprint 1', state: 'future' }),
      );
      const result = await createSprint(makeContext({ boardId: 1, name: 'Sprint 1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 26. update-sprint
  describe('update-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: 1, name: 'Updated Sprint', state: 'active' }),
      );
      const result = await updateSprint(makeContext({ sprintId: 1, name: 'Updated Sprint' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 27. add-issues-to-sprint
  describe('add-issues-to-sprint', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await addIssuesToSprint(
        makeContext({ sprintId: 1, issueKeys: ['TEST-1'] }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 28. create-issue-link
  describe('create-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await createIssueLink(
        makeContext({
          typeName: 'Blocks',
          inwardIssueKey: 'TEST-1',
          outwardIssueKey: 'TEST-2',
        }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 29. get-link-types
  describe('get-link-types', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          issueLinkTypes: [
            { id: '10000', name: 'Blocks', inward: 'is blocked by', outward: 'blocks' },
          ],
        }),
      );
      const result = await getLinkTypes(makeContext());
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 30. link-to-epic
  describe('link-to-epic', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await linkToEpic(
        makeContext({ epicKey: 'TEST-1', issueKeys: ['TEST-2'] }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 31. create-remote-issue-link
  describe('create-remote-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: 10000, self: 'https://test.atlassian.net/rest/api/3/issue/TEST-1/remotelink/10000' }),
      );
      const result = await createRemoteIssueLink(
        makeContext({ issueKey: 'TEST-1', url: 'https://example.com', title: 'Link' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 32. remove-issue-link
  describe('remove-issue-link', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await removeIssueLink(makeContext({ linkId: '10000' }));
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 33. get-worklog
  describe('get-worklog', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ worklogs: [], total: 0 }),
      );
      const result = await getWorklog(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 34. add-worklog
  describe('add-worklog', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ id: '10000', timeSpent: '2h', author: {} }),
      );
      const result = await addWorklog(
        makeContext({ issueKey: 'TEST-1', timeSpent: '2h' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 35. download-attachment
  describe('download-attachment', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse('file content here'),
      );
      const result = await downloadAttachment(makeContext({ attachmentId: '10000' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 36. get-issue-images
  describe('get-issue-images', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          attachments: [
            { mimeType: 'image/png', filename: 'test.png' },
          ],
        }),
      );
      const result = await getIssueImages(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 37. get-user-profile (no accountId)
  describe('get-user-profile (no accountId)', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          accountId: 'myself-123',
          displayName: 'Test User',
          emailAddress: 'test@test.com',
        }),
      );
      const result = await getUserProfile(makeContext({}));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 38. get-user-profile (with accountId)
  describe('get-user-profile (with accountId)', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          accountId: '123',
          displayName: 'Other User',
          emailAddress: 'other@test.com',
        }),
      );
      const result = await getUserProfile(makeContext({ accountId: '123' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 39. get-issue-watchers
  describe('get-issue-watchers', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          watchCount: 1,
          watchers: [{ accountId: '123', displayName: 'Test' }],
        }),
      );
      const result = await getIssueWatchers(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 40. add-watcher
  describe('add-watcher', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await addWatcher(
        makeContext({ issueKey: 'TEST-1', accountId: '123' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 41. remove-watcher
  describe('remove-watcher', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await removeWatcher(
        makeContext({ issueKey: 'TEST-1', accountId: '123' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 42. get-service-desks
  describe('get-service-desks', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [{ id: 1, projectName: 'Service Desk' }] }),
      );
      const result = await getServiceDesks(makeContext());
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 43. get-service-desk-queues
  describe('get-service-desk-queues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [{ id: 1, name: 'Queue 1' }] }),
      );
      const result = await getServiceDeskQueues(makeContext({ serviceDeskId: 1 }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 44. get-queue-issues
  describe('get-queue-issues', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ values: [], size: 0 }),
      );
      const result = await getQueueIssues(makeContext({ serviceDeskId: 1, queueId: 1 }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 45. get-issue-forms
  describe('get-issue-forms', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ value: { forms: [{ id: 'form-1', name: 'Test Form' }] } }),
      );
      const result = await getIssueForms(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 46. get-form-details
  describe('get-form-details', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          value: { id: 'form-1', name: 'Test Form', questions: [] },
        }),
      );
      const result = await getFormDetails(
        makeContext({ issueKey: 'TEST-1', formId: 'form-1' }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 47. update-form-answers
  describe('update-form-answers', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(mock204Response());
      const result = await updateFormAnswers(
        makeContext({ issueKey: 'TEST-1', formId: 'form-1', answers: { q1: 'a1' } }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output.toLowerCase()).toContain('success');
    });
  });

  // 48. get-issue-dates
  describe('get-issue-dates', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          key: 'TEST-1',
          fields: {
            created: '2024-01-01T00:00:00.000+0000',
            updated: '2024-01-02T00:00:00.000+0000',
            resolutiondate: null,
            duedate: null,
          },
        }),
      );
      const result = await getIssueDates(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 49. get-issue-sla
  describe('get-issue-sla', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          values: [{ name: 'Time to resolution', ongoingCycle: {} }],
        }),
      );
      const result = await getIssueSla(makeContext({ issueKey: 'TEST-1' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 50. get-dev-info
  describe('get-dev-info', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ detail: [{ repositories: [] }] }),
      );
      const result = await getDevInfo(makeContext({ issueId: '10001' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 51. get-dev-summary
  describe('get-dev-summary', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({
          summary: { repository: { count: 0 }, branch: { count: 0 } },
        }),
      );
      const result = await getDevSummary(makeContext({ issueId: '10001' }));
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });

  // 52. get-batch-dev-info
  describe('get-batch-dev-info', () => {
    it('should complete without error', async () => {
      vi.spyOn(global, 'fetch').mockResolvedValue(
        mockFetchResponse({ detail: [{ repositories: [] }] }),
      );
      const result = await getBatchDevInfo(
        makeContext({ issueIds: ['10001', '10002'] }),
      );
      expect(result.exitCode).toBe(0);
      expect(result.output).toBeTruthy();
    });
  });
});
