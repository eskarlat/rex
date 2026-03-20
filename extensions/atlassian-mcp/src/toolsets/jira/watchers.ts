import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { textResult, errorResult } from '../types.js';

export function createWatchersToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_watchers',
    tools: [
      {
        name: 'jira_get_issue_watchers',
        description: 'Get all watchers of a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'jira_add_watcher',
        description: 'Add a watcher to a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            accountId: { type: 'string', description: 'User account ID to add as watcher' },
          },
          required: ['issueKey', 'accountId'],
        },
      },
      {
        name: 'jira_remove_watcher',
        description: 'Remove a watcher from a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            accountId: { type: 'string', description: 'User account ID to remove' },
          },
          required: ['issueKey', 'accountId'],
        },
      },
    ],
    handlers: {
      jira_get_issue_watchers: async (args) => {
        try {
          const data = await client.getWatchers(args['issueKey'] as string);
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_add_watcher: async (args) => {
        try {
          await client.addWatcher(args['issueKey'] as string, args['accountId'] as string);
          return textResult({ success: true });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_remove_watcher: async (args) => {
        try {
          await client.removeWatcher(args['issueKey'] as string, args['accountId'] as string);
          return textResult({ success: true });
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
