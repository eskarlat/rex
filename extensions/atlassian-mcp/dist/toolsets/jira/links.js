import { markdownResult, errorResult } from '../types.js';
export function createLinksToolset(client) {
    return {
        name: 'jira_links',
        tools: [
            {
                name: 'jira_get_link_types',
                description: 'Get all available issue link types.',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'jira_link_to_epic',
                description: 'Link issues to an epic.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        epicKey: { type: 'string', description: 'Epic issue key' },
                        issueKeys: {
                            type: 'array',
                            items: { type: 'string' },
                            description: 'Issue keys to link',
                        },
                    },
                    required: ['epicKey', 'issueKeys'],
                },
            },
            {
                name: 'jira_create_issue_link',
                description: 'Create a link between two Jira issues.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        typeName: { type: 'string', description: 'Link type name (e.g., Blocks, Relates)' },
                        inwardIssueKey: { type: 'string', description: 'Inward issue key' },
                        outwardIssueKey: { type: 'string', description: 'Outward issue key' },
                    },
                    required: ['typeName', 'inwardIssueKey', 'outwardIssueKey'],
                },
            },
            {
                name: 'jira_create_remote_issue_link',
                description: 'Create a remote link on a Jira issue (link to external URL).',
                inputSchema: {
                    type: 'object',
                    properties: {
                        issueKey: { type: 'string', description: 'Issue key' },
                        url: { type: 'string', description: 'Remote URL' },
                        title: { type: 'string', description: 'Link title' },
                    },
                    required: ['issueKey', 'url', 'title'],
                },
            },
            {
                name: 'jira_remove_issue_link',
                description: 'Remove a link between two Jira issues.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        linkId: { type: 'string', description: 'Issue link ID' },
                    },
                    required: ['linkId'],
                },
            },
        ],
        handlers: {
            jira_get_link_types: async () => {
                try {
                    const data = await client.getLinkTypes();
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_link_to_epic: async (args) => {
                try {
                    const data = await client.linkToEpic(args['epicKey'], args['issueKeys']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_create_issue_link: async (args) => {
                try {
                    const data = await client.createIssueLink({
                        type: { name: args['typeName'] },
                        inwardIssue: { key: args['inwardIssueKey'] },
                        outwardIssue: { key: args['outwardIssueKey'] },
                    });
                    return markdownResult(data ?? { success: true });
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_create_remote_issue_link: async (args) => {
                try {
                    const data = await client.createRemoteIssueLink(args['issueKey'], {
                        object: { url: args['url'], title: args['title'] },
                    });
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_remove_issue_link: async (args) => {
                try {
                    await client.removeIssueLink(args['linkId']);
                    return markdownResult({ success: true });
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
