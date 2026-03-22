vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext } from '../../shared/types.js';
import getIssue from './get-issue.js';
import search from './search.js';
import getProjectIssues from './get-project-issues.js';
import createIssue from './create-issue.js';
import updateIssue from './update-issue.js';
import deleteIssue from './delete-issue.js';
import batchCreateIssues from './batch-create-issues.js';
import getChangelogs from './get-changelogs.js';

const mockJira = {
  getIssue: vi.fn(),
  search: vi.fn(),
  createIssue: vi.fn(),
  updateIssue: vi.fn(),
  deleteIssue: vi.fn(),
  bulkCreateIssues: vi.fn(),
  getChangelogs: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
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

describe('get-issue', () => {
  it('calls jira.getIssue with issueKey', async () => {
    mockJira.getIssue.mockResolvedValue({ key: 'TEST-1' });
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getIssue(ctx);
    expect(mockJira.getIssue).toHaveBeenCalledWith('TEST-1', undefined);
    expect(toOutput).toHaveBeenCalledWith({ key: 'TEST-1' });
  });

  it('passes expand parameter when provided', async () => {
    mockJira.getIssue.mockResolvedValue({ key: 'TEST-1' });
    const ctx = makeContext({ issueKey: 'TEST-1', expand: 'changelog' });
    await getIssue(ctx);
    expect(mockJira.getIssue).toHaveBeenCalledWith('TEST-1', 'changelog');
  });

  it('returns errorOutput on error', async () => {
    mockJira.getIssue.mockRejectedValue(new Error('not found'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getIssue(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('search', () => {
  it('calls jira.search with jql, startAt, maxResults, fields', async () => {
    mockJira.search.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ jql: 'project=TEST', startAt: 10, maxResults: 25, fields: ['summary'] });
    await search(ctx);
    expect(mockJira.search).toHaveBeenCalledWith('project=TEST', 10, 25, ['summary']);
    expect(toOutput).toHaveBeenCalledWith({ issues: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.search.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ jql: 'project=TEST' });
    await search(ctx);
    expect(mockJira.search).toHaveBeenCalledWith('project=TEST', 0, 50, undefined);
  });

  it('returns errorOutput on error', async () => {
    mockJira.search.mockRejectedValue(new Error('bad jql'));
    const ctx = makeContext({ jql: 'invalid' });
    const result = await search(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-project-issues', () => {
  it('calls jira.search with project JQL', async () => {
    mockJira.search.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ projectKey: 'PROJ', startAt: 5, maxResults: 10 });
    await getProjectIssues(ctx);
    expect(mockJira.search).toHaveBeenCalledWith(
      'project = PROJ ORDER BY updated DESC',
      5,
      10,
    );
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.search.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ projectKey: 'PROJ' });
    await getProjectIssues(ctx);
    expect(mockJira.search).toHaveBeenCalledWith(
      'project = PROJ ORDER BY updated DESC',
      0,
      50,
    );
  });

  it('returns errorOutput on error', async () => {
    mockJira.search.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ projectKey: 'PROJ' });
    const result = await getProjectIssues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('create-issue', () => {
  it('builds fields with project, issuetype, summary, description (ADF) and calls jira.createIssue', async () => {
    mockJira.createIssue.mockResolvedValue({ key: 'TEST-2' });
    const ctx = makeContext({
      projectKey: 'TEST',
      issueType: 'Task',
      summary: 'My task',
      description: 'Some description',
    });
    await createIssue(ctx);
    expect(mockJira.createIssue).toHaveBeenCalledWith({
      project: { key: 'TEST' },
      issuetype: { name: 'Task' },
      summary: 'My task',
      description: {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Some description' }],
          },
        ],
      },
    });
    expect(toOutput).toHaveBeenCalledWith({ key: 'TEST-2' });
  });

  it('creates issue without description when not provided', async () => {
    mockJira.createIssue.mockResolvedValue({ key: 'TEST-3' });
    const ctx = makeContext({
      projectKey: 'TEST',
      issueType: 'Bug',
      summary: 'A bug',
    });
    await createIssue(ctx);
    expect(mockJira.createIssue).toHaveBeenCalledWith({
      project: { key: 'TEST' },
      issuetype: { name: 'Bug' },
      summary: 'A bug',
    });
  });

  it('merges additionalFields', async () => {
    mockJira.createIssue.mockResolvedValue({ key: 'TEST-4' });
    const ctx = makeContext({
      projectKey: 'TEST',
      issueType: 'Task',
      summary: 'Task',
      additionalFields: { priority: { name: 'High' } },
    });
    await createIssue(ctx);
    expect(mockJira.createIssue).toHaveBeenCalledWith(
      expect.objectContaining({ priority: { name: 'High' } }),
    );
  });

  it('returns errorOutput on error', async () => {
    mockJira.createIssue.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ projectKey: 'TEST', issueType: 'Task', summary: 'x' });
    const result = await createIssue(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('update-issue', () => {
  it('calls jira.updateIssue and returns success', async () => {
    mockJira.updateIssue.mockResolvedValue(undefined);
    const fields = { summary: 'Updated' };
    const ctx = makeContext({ issueKey: 'TEST-1', fields });
    await updateIssue(ctx);
    expect(mockJira.updateIssue).toHaveBeenCalledWith('TEST-1', fields);
    expect(toOutput).toHaveBeenCalledWith({ success: true, issueKey: 'TEST-1' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.updateIssue.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1', fields: {} });
    const result = await updateIssue(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('delete-issue', () => {
  it('calls jira.deleteIssue and returns success', async () => {
    mockJira.deleteIssue.mockResolvedValue(undefined);
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await deleteIssue(ctx);
    expect(mockJira.deleteIssue).toHaveBeenCalledWith('TEST-1');
    expect(toOutput).toHaveBeenCalledWith({ success: true, issueKey: 'TEST-1' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.deleteIssue.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await deleteIssue(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('batch-create-issues', () => {
  it('calls jira.bulkCreateIssues', async () => {
    const issues = [{ fields: { summary: 'A' } }, { fields: { summary: 'B' } }];
    mockJira.bulkCreateIssues.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ issues });
    await batchCreateIssues(ctx);
    expect(mockJira.bulkCreateIssues).toHaveBeenCalledWith(issues);
    expect(toOutput).toHaveBeenCalledWith({ issues: [] });
  });

  it('returns errorOutput on error', async () => {
    mockJira.bulkCreateIssues.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issues: [] });
    const result = await batchCreateIssues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-changelogs', () => {
  it('calls jira.getChangelogs with issueKey, startAt, maxResults', async () => {
    mockJira.getChangelogs.mockResolvedValue({ values: [] });
    const ctx = makeContext({ issueKey: 'TEST-1', startAt: 5, maxResults: 20 });
    await getChangelogs(ctx);
    expect(mockJira.getChangelogs).toHaveBeenCalledWith('TEST-1', 5, 20);
    expect(toOutput).toHaveBeenCalledWith({ values: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.getChangelogs.mockResolvedValue({ values: [] });
    const ctx = makeContext({ issueKey: 'TEST-1' });
    await getChangelogs(ctx);
    expect(mockJira.getChangelogs).toHaveBeenCalledWith('TEST-1', 0, 100);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getChangelogs.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ issueKey: 'TEST-1' });
    const result = await getChangelogs(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
