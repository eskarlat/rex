import { textResult, errorResult } from '../types.js';
export function createWorklogToolset(client) {
    return {
        name: 'jira_worklog',
        tools: [
            {
                name: 'jira_get_worklog',
                description: 'Get work log entries for a Jira issue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                    },
                    required: ['issueKey'],
                },
            },
            {
                name: 'jira_add_worklog',
                description: 'Add a work log entry to a Jira issue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                        timeSpent: { type: 'string', description: 'Time spent (e.g., "2h 30m")' },
                        comment: { type: 'string', description: 'Work log comment' },
                        started: { type: 'string', description: 'Start time (ISO 8601)' },
                    },
                    required: ['issueKey', 'timeSpent'],
                },
            },
        ],
        handlers: {
            jira_get_worklog: async (args) => {
                try {
                    const data = await client.getWorklog(args['issueKey']);
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_add_worklog: async (args) => {
                try {
                    const worklog = {
                        timeSpent: args['timeSpent'],
                    };
                    if (args['comment']) {
                        worklog['comment'] = {
                            type: 'doc',
                            version: 1,
                            content: [
                                {
                                    type: 'paragraph',
                                    content: [{ type: 'text', text: args['comment'] }],
                                },
                            ],
                        };
                    }
                    if (args['started'])
                        worklog['started'] = args['started'];
                    const data = await client.addWorklog(args['issueKey'], worklog);
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
