import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { textResult, errorResult } from '../types.js';

export function createCommentsToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_comments',
    tools: [
      {
        name: 'jira_add_comment',
        description: 'Add a comment to a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            body: { type: 'string', description: 'Comment text' },
          },
          required: ['issueKey', 'body'],
        },
      },
      {
        name: 'jira_edit_comment',
        description: 'Edit an existing comment on a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            commentId: { type: 'string', description: 'Comment ID' },
            body: { type: 'string', description: 'Updated comment text' },
          },
          required: ['issueKey', 'commentId', 'body'],
        },
      },
    ],
    handlers: {
      jira_add_comment: async (args) => {
        try {
          const adfBody = {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: args['body'] as string }],
              },
            ],
          };
          const data = await client.addComment(args['issueKey'] as string, adfBody);
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_edit_comment: async (args) => {
        try {
          const adfBody = {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: args['body'] as string }],
              },
            ],
          };
          const data = await client.editComment(
            args['issueKey'] as string,
            args['commentId'] as string,
            adfBody,
          );
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
