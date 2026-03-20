import { textResult, errorResult } from '../types.js';
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
                    },
                    required: ['issueId'],
                },
            },
            {
                name: 'jira_get_issues_development_info',
                description: 'Get development information for multiple Jira issues in batch.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueIds: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Array of issue IDs',
                        },
                    },
                    required: ['issueIds'],
                },
            },
        ],
        handlers: {
            jira_get_issue_development_info: async (args) => {
                try {
                    const data = await client.getDevelopmentInfo(args['issueId']);
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_issues_development_info: async (args) => {
                try {
                    const data = await client.getBatchDevelopmentInfo(args['issueIds']);
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
