import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { safeExec } from '../types.js';

function devInfoArgs(args: Record<string, unknown>): [string, string] {
  return [
    (args['applicationType'] as string | undefined) ?? 'stash',
    (args['dataType'] as string | undefined) ?? 'repository',
  ];
}

export function createDevelopmentToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_development',
    tools: [
      {
        name: 'jira_get_issue_development_info',
        description:
          'Get development information (commits, branches, PRs) linked to a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: { type: 'string', description: 'Jira issue ID (numeric)' },
            applicationType: {
              type: 'string',
              description:
                'Source type: "stash" (Bitbucket), "GitHub", "GitLab" (default: stash)',
            },
            dataType: {
              type: 'string',
              description: 'Data type: "repository" or "pullrequest" (default: repository)',
            },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'jira_get_issue_development_summary',
        description: 'Get a summary of all development integrations linked to a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueId: { type: 'string', description: 'Jira issue ID (numeric)' },
          },
          required: ['issueId'],
        },
      },
      {
        name: 'jira_get_issues_development_info',
        description:
          'Get development information for multiple Jira issues (sequential lookups).',
        inputSchema: {
          type: 'object',
          properties: {
            issueIds: {
              type: 'array',
              items: { type: 'string' },
              description: 'Array of issue IDs',
            },
            applicationType: {
              type: 'string',
              description: 'Source type (default: stash)',
            },
            dataType: {
              type: 'string',
              description: 'Data type (default: repository)',
            },
          },
          required: ['issueIds'],
        },
      },
    ],
    handlers: {
      jira_get_issue_development_info: (args) =>
        safeExec(() =>
          client.getDevelopmentInfo(args['issueId'] as string, ...devInfoArgs(args)),
        ),
      jira_get_issue_development_summary: (args) =>
        safeExec(() => client.getDevelopmentSummary(args['issueId'] as string)),
      jira_get_issues_development_info: (args) =>
        safeExec(() =>
          client.getBatchDevelopmentInfo(args['issueIds'] as string[], ...devInfoArgs(args)),
        ),
    },
  };
}
