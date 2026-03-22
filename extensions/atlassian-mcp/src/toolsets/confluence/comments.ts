import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { safeExec, confluencePaginationArgs } from '../types.js';

export function createConfluenceCommentsToolset(client: ConfluenceClient): Toolset {
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
      confluence_get_comments: (args) =>
        safeExec(() =>
          client.getComments(args['pageId'] as string, ...confluencePaginationArgs(args)),
        ),
      confluence_add_comment: (args) =>
        safeExec(() => client.addComment(args['pageId'] as string, args['body'] as string)),
      confluence_reply_to_comment: (args) =>
        safeExec(() =>
          client.replyToComment(
            args['pageId'] as string,
            args['parentCommentId'] as string,
            args['body'] as string,
          ),
        ),
    },
  };
}
