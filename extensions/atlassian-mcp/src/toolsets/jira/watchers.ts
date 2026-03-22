import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset, ToolResult } from '../types.js';
import { safeExec } from '../types.js';

function watcherAction(
  fn: () => Promise<void>,
): Promise<ToolResult> {
  return safeExec(async () => {
    await fn();
    return { success: true };
  });
}

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
      jira_get_issue_watchers: (args) =>
        safeExec(() => client.getWatchers(args['issueKey'] as string)),
      jira_add_watcher: (args) =>
        watcherAction(() =>
          client.addWatcher(args['issueKey'] as string, args['accountId'] as string),
        ),
      jira_remove_watcher: (args) =>
        watcherAction(() =>
          client.removeWatcher(args['issueKey'] as string, args['accountId'] as string),
        ),
    },
  };
}
