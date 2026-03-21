import { markdownResult, errorResult } from '../types.js';
export function createTransitionsToolset(client) {
    return {
        name: 'jira_transitions',
        tools: [
            {
                name: 'jira_get_transitions',
                description: 'Get available workflow transitions for a Jira issue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                    },
                    required: ['issueKey'],
                },
            },
            {
                name: 'jira_transition_issue',
                description: 'Transition a Jira issue to a new workflow status.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                        transitionId: {
                            type: 'string',
                            description: 'Transition ID (from jira_get_transitions)',
                        },
                    },
                    required: ['issueKey', 'transitionId'],
                },
            },
        ],
        handlers: {
            jira_get_transitions: async (args) => {
                try {
                    const data = await client.getTransitions(args['issueKey']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_transition_issue: async (args) => {
                try {
                    await client.transitionIssue(args['issueKey'], args['transitionId']);
                    return markdownResult({ success: true, issueKey: args['issueKey'] });
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
