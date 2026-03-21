import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

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
      jira_get_issue: async (args) => {
        try {
          const data = await client.getIssue(
            args['issueKey'] as string,
            args['expand'] as string | undefined,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_search: async (args) => {
        try {
          const data = await client.search(
            args['jql'] as string,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
            args['fields'] as string[] | undefined,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_project_issues: async (args) => {
        try {
          const data = await client.search(
            `project = ${args['projectKey'] as string} ORDER BY updated DESC`,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_create_issue: async (args) => {
        try {
          const fields: Record<string, unknown> = {
            project: { key: args['projectKey'] as string },
            issuetype: { name: args['issueType'] as string },
            summary: args['summary'] as string,
            ...(args['fields'] as Record<string, unknown> | undefined),
          };
          if (args['description']) {
            fields['description'] = {
              type: 'doc',
              version: 1,
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: args['description'] as string }],
                },
              ],
            };
          }
          const data = await client.createIssue(fields);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_update_issue: async (args) => {
        try {
          await client.updateIssue(
            args['issueKey'] as string,
            args['fields'] as Record<string, unknown>,
          );
          return markdownResult({ success: true, issueKey: args['issueKey'] });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_delete_issue: async (args) => {
        try {
          await client.deleteIssue(args['issueKey'] as string);
          return markdownResult({ success: true, issueKey: args['issueKey'] });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_batch_create_issues: async (args) => {
        try {
          const issues = args['issues'] as Array<{ fields: Record<string, unknown> }>;
          const data = await client.bulkCreateIssues(issues);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_batch_get_changelogs: async (args) => {
        try {
          const data = await client.getChangelogs(
            args['issueKey'] as string,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 100,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
