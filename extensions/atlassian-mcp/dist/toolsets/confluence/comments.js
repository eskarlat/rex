import { markdownResult, errorResult } from '../types.js';
export function createConfluenceCommentsToolset(client) {
    return {
        name: 'confluence_comments',
        tools: [
            {
                name: 'confluence_get_comments',
                description: 'Get comments on a Confluence page.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pageId: { type: 'string', description: 'Page ID' },
                        limit: { type: 'number', description: 'Max results' },
                        start: { type: 'number', description: 'Pagination start' },
                    },
                    required: ['pageId'],
                },
            },
            {
                name: 'confluence_add_comment',
                description: 'Add a comment to a Confluence page.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pageId: { type: 'string', description: 'Page ID' },
                        body: { type: 'string', description: 'Comment body (HTML/storage format)' },
                    },
                    required: ['pageId', 'body'],
                },
            },
            {
                name: 'confluence_reply_to_comment',
                description: 'Reply to an existing comment on a Confluence page.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        pageId: { type: 'string', description: 'Page ID' },
                        parentCommentId: { type: 'string', description: 'Parent comment ID to reply to' },
                        body: { type: 'string', description: 'Reply body' },
                    },
                    required: ['pageId', 'parentCommentId', 'body'],
                },
            },
        ],
        handlers: {
            confluence_get_comments: async (args) => {
                try {
                    const data = await client.getComments(args['pageId'], args['limit'] ?? 25, args['start'] ?? 0);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            confluence_add_comment: async (args) => {
                try {
                    const data = await client.addComment(args['pageId'], args['body']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            confluence_reply_to_comment: async (args) => {
                try {
                    const data = await client.replyToComment(args['pageId'], args['parentCommentId'], args['body']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
