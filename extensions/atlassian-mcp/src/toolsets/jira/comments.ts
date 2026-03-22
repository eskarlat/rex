import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { safeExec, buildAdfBody } from '../types.js';

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
      jira_add_comment: (args) =>
        safeExec(() =>
          client.addComment(args['issueKey'] as string, buildAdfBody(args['body'] as string)),
        ),
      jira_edit_comment: (args) =>
        safeExec(() =>
          client.editComment(
            args['issueKey'] as string,
            args['commentId'] as string,
            buildAdfBody(args['body'] as string),
          ),
        ),
    },
  };
}
