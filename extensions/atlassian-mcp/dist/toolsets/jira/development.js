import { markdownResult, errorResult } from '../types.js';
export function createDevelopmentToolset(client) {
    return {
        name: 'jira_development',
        tools: [
            {
                name: 'jira_get_issue_development_info',
                description: 'Get development information (commits, branches, PRs) linked to a Jira issue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueId: { type: 'string', description: 'Jira issue ID (numeric)' },
                        applicationType: {
                            type: 'string',
                            description: 'Source type: "stash" (Bitbucket), "GitHub", "GitLab" (default: stash)',
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
                description: 'Get development information for multiple Jira issues (sequential lookups).',
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
            jira_get_issue_development_info: async (args) => {
                try {
                    const data = await client.getDevelopmentInfo(args['issueId'], args['applicationType'] ?? 'stash', args['dataType'] ?? 'repository');
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_issue_development_summary: async (args) => {
                try {
                    const data = await client.getDevelopmentSummary(args['issueId']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_issues_development_info: async (args) => {
                try {
                    const data = await client.getBatchDevelopmentInfo(args['issueIds'], args['applicationType'] ?? 'stash', args['dataType'] ?? 'repository');
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
