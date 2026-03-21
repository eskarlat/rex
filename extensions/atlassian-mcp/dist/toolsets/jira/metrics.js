import { markdownResult, errorResult } from '../types.js';
export function createMetricsToolset(client) {
    return {
        name: 'jira_metrics',
        tools: [
            {
                name: 'jira_get_issue_dates',
                description: 'Get key date fields for a Jira issue (created, updated, resolved, due date).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                    },
                    required: ['issueKey'],
                },
            },
            {
                name: 'jira_get_issue_sla',
                description: 'Get SLA information for a Jira Service Management request.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue/request key' },
                    },
                    required: ['issueKey'],
                },
            },
        ],
        handlers: {
            jira_get_issue_dates: async (args) => {
                try {
                    const data = await client.getIssueDateFields(args['issueKey']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_issue_sla: async (args) => {
                try {
                    const data = await client.getIssueSla(args['issueKey']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
