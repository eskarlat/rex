/**
 * Integration tests for all Jira commands.
 *
 * No mocking — each command runs the full stack:
 *   command → jiraCommand helper → createClients → JiraClient → real fetch
 *
 * Two modes:
 *   1. Missing config — always runs, verifies graceful error handling
 *   2. Live API — runs only when ATLASSIAN_* env vars are set, verifies real responses
 */
import { describe, it, expect } from 'vitest';

import { missingConfigContext, liveContext, hasCredentials, testConfig } from './test-config.js';
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

// ---------------------------------------------------------------------------
// Missing config — every command must return exitCode 1 without throwing
// ---------------------------------------------------------------------------
describe('Jira Commands — missing config', () => {
  const ctx = missingConfigContext;

  it('get-issue returns error without throwing', async () => {
    const result = await getIssue(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
    expect(result.output).toBeTruthy();
  });

  it('search returns error without throwing', async () => {
    const result = await search(ctx({ jql: 'project=TEST' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-project-issues returns error without throwing', async () => {
    const result = await getProjectIssues(ctx({ projectKey: 'TEST' }));
    expect(result.exitCode).toBe(1);
  });

  it('create-issue returns error without throwing', async () => {
    const result = await createIssue(ctx({ projectKey: 'TEST', issueType: 'Task', summary: 'Test' }));
    expect(result.exitCode).toBe(1);
  });

  it('update-issue returns error without throwing', async () => {
    const result = await updateIssue(ctx({ issueKey: 'TEST-1', fields: { summary: 'x' } }));
    expect(result.exitCode).toBe(1);
  });

  it('delete-issue returns error without throwing', async () => {
    const result = await deleteIssue(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('batch-create-issues returns error without throwing', async () => {
    const result = await batchCreateIssues(ctx({ issues: [{ fields: { summary: 'A' } }] }));
    expect(result.exitCode).toBe(1);
  });

  it('get-changelogs returns error without throwing', async () => {
    const result = await getChangelogs(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('search-fields returns error without throwing', async () => {
    const result = await searchFields(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('get-field-options returns error without throwing', async () => {
    const result = await getFieldOptions(ctx({ fieldId: 'cf_10001', contextId: '10000' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-comment returns error without throwing', async () => {
    const result = await addComment(ctx({ issueKey: 'TEST-1', body: 'hello' }));
    expect(result.exitCode).toBe(1);
  });

  it('edit-comment returns error without throwing', async () => {
    const result = await editComment(ctx({ issueKey: 'TEST-1', commentId: '10000', body: 'x' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-transitions returns error without throwing', async () => {
    const result = await getTransitions(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('transition-issue returns error without throwing', async () => {
    const result = await transitionIssue(ctx({ issueKey: 'TEST-1', transitionId: '31' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-all-projects returns error without throwing', async () => {
    const result = await getAllProjects(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('get-project-versions returns error without throwing', async () => {
    const result = await getProjectVersions(ctx({ projectKey: 'TEST' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-project-components returns error without throwing', async () => {
    const result = await getProjectComponents(ctx({ projectKey: 'TEST' }));
    expect(result.exitCode).toBe(1);
  });

  it('create-version returns error without throwing', async () => {
    const result = await createVersion(ctx({ projectKey: 'TEST', name: 'v1.0' }));
    expect(result.exitCode).toBe(1);
  });

  it('batch-create-versions returns error without throwing', async () => {
    const result = await batchCreateVersions(ctx({ projectKey: 'TEST', versions: [{ name: 'v1' }] }));
    expect(result.exitCode).toBe(1);
  });

  it('get-agile-boards returns error without throwing', async () => {
    const result = await getAgileBoards(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('get-board-issues returns error without throwing', async () => {
    const result = await getBoardIssues(ctx({ boardId: 1 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-sprints-from-board returns error without throwing', async () => {
    const result = await getSprintsFromBoard(ctx({ boardId: 1 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-sprint-issues returns error without throwing', async () => {
    const result = await getSprintIssues(ctx({ sprintId: 1 }));
    expect(result.exitCode).toBe(1);
  });

  it('create-sprint returns error without throwing', async () => {
    const result = await createSprint(ctx({ boardId: 1, name: 'Sprint 1' }));
    expect(result.exitCode).toBe(1);
  });

  it('update-sprint returns error without throwing', async () => {
    const result = await updateSprint(ctx({ sprintId: 1, name: 'Updated' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-issues-to-sprint returns error without throwing', async () => {
    const result = await addIssuesToSprint(ctx({ sprintId: 1, issueKeys: ['TEST-1'] }));
    expect(result.exitCode).toBe(1);
  });

  it('create-issue-link returns error without throwing', async () => {
    const result = await createIssueLink(
      ctx({ typeName: 'Blocks', inwardIssueKey: 'TEST-1', outwardIssueKey: 'TEST-2' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-link-types returns error without throwing', async () => {
    const result = await getLinkTypes(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('link-to-epic returns error without throwing', async () => {
    const result = await linkToEpic(ctx({ epicKey: 'TEST-1', issueKeys: ['TEST-2'] }));
    expect(result.exitCode).toBe(1);
  });

  it('create-remote-issue-link returns error without throwing', async () => {
    const result = await createRemoteIssueLink(
      ctx({ issueKey: 'TEST-1', url: 'https://example.com', title: 'Link' }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('remove-issue-link returns error without throwing', async () => {
    const result = await removeIssueLink(ctx({ linkId: '10000' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-worklog returns error without throwing', async () => {
    const result = await getWorklog(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-worklog returns error without throwing', async () => {
    const result = await addWorklog(ctx({ issueKey: 'TEST-1', timeSpent: '2h' }));
    expect(result.exitCode).toBe(1);
  });

  it('download-attachment returns error without throwing', async () => {
    const result = await downloadAttachment(ctx({ attachmentId: '10000' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-issue-images returns error without throwing', async () => {
    const result = await getIssueImages(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-user-profile returns error without throwing', async () => {
    const result = await getUserProfile(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('get-issue-watchers returns error without throwing', async () => {
    const result = await getIssueWatchers(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('add-watcher returns error without throwing', async () => {
    const result = await addWatcher(ctx({ issueKey: 'TEST-1', accountId: '123' }));
    expect(result.exitCode).toBe(1);
  });

  it('remove-watcher returns error without throwing', async () => {
    const result = await removeWatcher(ctx({ issueKey: 'TEST-1', accountId: '123' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-service-desks returns error without throwing', async () => {
    const result = await getServiceDesks(ctx());
    expect(result.exitCode).toBe(1);
  });

  it('get-service-desk-queues returns error without throwing', async () => {
    const result = await getServiceDeskQueues(ctx({ serviceDeskId: 1 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-queue-issues returns error without throwing', async () => {
    const result = await getQueueIssues(ctx({ serviceDeskId: 1, queueId: 1 }));
    expect(result.exitCode).toBe(1);
  });

  it('get-issue-forms returns error without throwing', async () => {
    const result = await getIssueForms(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-form-details returns error without throwing', async () => {
    const result = await getFormDetails(ctx({ issueKey: 'TEST-1', formId: 'form-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('update-form-answers returns error without throwing', async () => {
    const result = await updateFormAnswers(
      ctx({ issueKey: 'TEST-1', formId: 'form-1', answers: { q1: 'a1' } }),
    );
    expect(result.exitCode).toBe(1);
  });

  it('get-issue-dates returns error without throwing', async () => {
    const result = await getIssueDates(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-issue-sla returns error without throwing', async () => {
    const result = await getIssueSla(ctx({ issueKey: 'TEST-1' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-dev-info returns error without throwing', async () => {
    const result = await getDevInfo(ctx({ issueId: '10001' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-dev-summary returns error without throwing', async () => {
    const result = await getDevSummary(ctx({ issueId: '10001' }));
    expect(result.exitCode).toBe(1);
  });

  it('get-batch-dev-info returns error without throwing', async () => {
    const result = await getBatchDevInfo(ctx({ issueIds: ['10001'] }));
    expect(result.exitCode).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Live API — only runs when ATLASSIAN_* env vars are set
// ---------------------------------------------------------------------------
describe.skipIf(!hasCredentials)('Jira Commands — live API', { timeout: 30_000 }, () => {
  const ctx = liveContext;

  it('get-user-profile returns current user', async () => {
    const result = await getUserProfile(ctx());
    expect(result.exitCode).toBe(0);
    expect(result.output).toBeTruthy();
  });

  it('get-all-projects returns project list', async () => {
    const result = await getAllProjects(ctx());
    expect(result.exitCode).toBe(0);
  });

  it('search-fields returns field list', async () => {
    const result = await searchFields(ctx());
    expect(result.exitCode).toBe(0);
  });

  it('get-link-types returns link types', async () => {
    const result = await getLinkTypes(ctx());
    expect(result.exitCode).toBe(0);
  });

  it('search returns issues', async () => {
    const result = await search(ctx({ jql: `project = ${testConfig.projectKey}`, maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-project-issues returns issues', async () => {
    const result = await getProjectIssues(ctx({ projectKey: testConfig.projectKey, maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-issue returns issue details', async () => {
    const result = await getIssue(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-transitions returns transitions', async () => {
    const result = await getTransitions(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-changelogs returns changelog', async () => {
    const result = await getChangelogs(ctx({ issueKey: testConfig.issueKey, maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-issue-watchers returns watchers', async () => {
    const result = await getIssueWatchers(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-worklog returns worklog', async () => {
    const result = await getWorklog(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-issue-images returns images', async () => {
    const result = await getIssueImages(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-issue-dates returns dates', async () => {
    const result = await getIssueDates(ctx({ issueKey: testConfig.issueKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-project-versions returns versions', async () => {
    const result = await getProjectVersions(ctx({ projectKey: testConfig.projectKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-project-components returns components', async () => {
    const result = await getProjectComponents(ctx({ projectKey: testConfig.projectKey }));
    expect(result.exitCode).toBe(0);
  });

  it('get-agile-boards returns boards', async () => {
    const result = await getAgileBoards(ctx({ maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-board-issues returns issues', async () => {
    const result = await getBoardIssues(ctx({ boardId: testConfig.boardId, maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });

  it('get-sprints-from-board returns sprints', async () => {
    const result = await getSprintsFromBoard(ctx({ boardId: testConfig.boardId, maxResults: 5 }));
    expect(result.exitCode).toBe(0);
  });
});
