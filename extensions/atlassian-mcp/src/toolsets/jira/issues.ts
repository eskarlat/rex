import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { safeExec, paginationArgs, buildAdfBody } from '../types.js';

export function createIssuesToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_issues',
    tools: [
      {
        name: 'jira_get_issue',
        description: 'Get a Jira issue by key (e.g., PROJ-123). Returns full issue details.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key (e.g., PROJ-123)' },
            expand: { type: 'string', description: 'Comma-separated fields to expand' },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'jira_search',
        description: 'Search Jira issues using JQL (Jira Query Language).',
        inputSchema: {
          type: 'object',
          properties: {
            jql: { type: 'string', description: 'JQL query string' },
            startAt: { type: 'number', description: 'Pagination start index (default: 0)' },
            maxResults: { type: 'number', description: 'Max results to return (default: 50)' },
            fields: { type: 'array', items: { type: 'string' }, description: 'Fields to return' },
          },
          required: ['jql'],
        },
      },
      {
        name: 'jira_get_project_issues',
        description: 'Get all issues for a specific Jira project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
            startAt: { type: 'number', description: 'Pagination start index' },
            maxResults: { type: 'number', description: 'Max results' },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'jira_create_issue',
        description: 'Create a new Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
            issueType: { type: 'string', description: 'Issue type name (e.g., Task, Bug, Story)' },
            summary: { type: 'string', description: 'Issue summary/title' },
            description: { type: 'string', description: 'Issue description (plain text)' },
            fields: { type: 'object', description: 'Additional fields to set' },
          },
          required: ['projectKey', 'issueType', 'summary'],
        },
      },
      {
        name: 'jira_update_issue',
        description: 'Update an existing Jira issue fields.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            fields: { type: 'object', description: 'Fields to update' },
          },
          required: ['issueKey', 'fields'],
        },
      },
      {
        name: 'jira_delete_issue',
        description: 'Delete a Jira issue by key.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'jira_batch_create_issues',
        description: 'Create multiple Jira issues in bulk.',
        inputSchema: {
          type: 'object',
          properties: {
            issues: {
              type: 'array',
              items: { type: 'object' },
              description:
                'Array of issue objects with { fields: { project, issuetype, summary, ... } }',
            },
          },
          required: ['issues'],
        },
      },
      {
        name: 'jira_batch_get_changelogs',
        description: 'Get the changelog history for a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            startAt: { type: 'number', description: 'Pagination start index' },
            maxResults: { type: 'number', description: 'Max results' },
          },
          required: ['issueKey'],
        },
      },
    ],
    handlers: {
      jira_get_issue: (args) =>
        safeExec(() =>
          client.getIssue(args['issueKey'] as string, args['expand'] as string | undefined),
        ),
      jira_search: (args) => {
        const [startAt, maxResults] = paginationArgs(args);
        return safeExec(() =>
          client.search(
            args['jql'] as string,
            startAt,
            maxResults,
            args['fields'] as string[] | undefined,
          ),
        );
      },
      jira_get_project_issues: (args) => {
        const [startAt, maxResults] = paginationArgs(args);
        return safeExec(() =>
          client.search(
            `project = ${args['projectKey'] as string} ORDER BY updated DESC`,
            startAt,
            maxResults,
          ),
        );
      },
      jira_create_issue: (args) =>
        safeExec(() => {
          const fields: Record<string, unknown> = {
            project: { key: args['projectKey'] as string },
            issuetype: { name: args['issueType'] as string },
            summary: args['summary'] as string,
            ...(args['fields'] as Record<string, unknown> | undefined),
          };
          if (args['description'])
            fields['description'] = buildAdfBody(args['description'] as string);
          return client.createIssue(fields);
        }),
      jira_update_issue: (args) =>
        safeExec(async () => {
          await client.updateIssue(
            args['issueKey'] as string,
            args['fields'] as Record<string, unknown>,
          );
          return { success: true, issueKey: args['issueKey'] };
        }),
      jira_delete_issue: (args) =>
        safeExec(async () => {
          await client.deleteIssue(args['issueKey'] as string);
          return { success: true, issueKey: args['issueKey'] };
        }),
      jira_batch_create_issues: (args) =>
        safeExec(() => {
          const issues = args['issues'] as Array<{ fields: Record<string, unknown> }>;
          return client.bulkCreateIssues(issues);
        }),
      jira_batch_get_changelogs: (args) => {
        const [startAt, maxResults] = paginationArgs(args, { startAt: 0, maxResults: 100 });
        return safeExec(() =>
          client.getChangelogs(args['issueKey'] as string, startAt, maxResults),
        );
      },
    },
  };
}
