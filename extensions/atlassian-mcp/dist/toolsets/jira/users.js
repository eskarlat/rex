import { markdownResult, errorResult } from '../types.js';
export function createUsersToolset(client) {
    return {
        name: 'jira_users',
        tools: [
            {
                name: 'jira_get_user_profile',
                description: 'Get the current user profile, or another user by account ID.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        accountId: { type: 'string', description: 'Account ID (omit for current user)' },
                    },
                },
            },
        ],
        handlers: {
            jira_get_user_profile: async (args) => {
                try {
                    const accountId = args['accountId'];
                    const data = accountId ? await client.getUser(accountId) : await client.getMyself();
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
