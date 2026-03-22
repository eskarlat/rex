import type { JiraClient } from '../client/jira-client.js';
import type { ConfluenceClient } from '../client/confluence-client.js';

import { createClients } from './client.js';
import { toOutput, errorOutput } from './formatters.js';
import type { CommandResult, CommandContext } from './types.js';

/** Wrap a Jira command handler with createClients + toOutput + errorOutput */
export async function jiraCommand<T extends Record<string, unknown>>(
  context: CommandContext<T>,
  fn: (jira: JiraClient, args: T) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await fn(jira, context.args);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}

/** Wrap a Confluence command handler with createClients + toOutput + errorOutput */
export async function confluenceCommand<T extends Record<string, unknown>>(
  context: CommandContext<T>,
  fn: (confluence: ConfluenceClient, args: T) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const data = await fn(confluence, context.args);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
