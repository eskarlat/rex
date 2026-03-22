import type { JiraClient } from '../client/jira-client.js';
import type { ConfluenceClient } from '../client/confluence-client.js';

import { createClients } from './client.js';
import { toOutput, errorOutput } from './formatters.js';
import type { ExecutionContext, CommandResult } from './types.js';

/** Wrap a Jira command handler with standard createClients + toOutput + errorOutput */
export async function jiraCommand(
  context: ExecutionContext,
  fn: (jira: JiraClient, args: ExecutionContext['args']) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await fn(jira, context.args);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}

/** Wrap a Confluence command handler with standard createClients + toOutput + errorOutput */
export async function confluenceCommand(
  context: ExecutionContext,
  fn: (confluence: ConfluenceClient, args: ExecutionContext['args']) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const data = await fn(confluence, context.args);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}

/** Extract standard pagination args (startAt/maxResults) with defaults */
export function paginationArgs(
  args: ExecutionContext['args'],
  defaults = { startAt: 0, maxResults: 50 },
): { startAt: number; maxResults: number } {
  return {
    startAt: (args['startAt'] as number | undefined) ?? defaults.startAt,
    maxResults: (args['maxResults'] as number | undefined) ?? defaults.maxResults,
  };
}

/** Extract standard Confluence pagination args (start/limit) with defaults */
export function confluencePaginationArgs(
  args: ExecutionContext['args'],
  defaults = { start: 0, limit: 25 },
): { start: number; limit: number } {
  return {
    start: (args['start'] as number | undefined) ?? defaults.start,
    limit: (args['limit'] as number | undefined) ?? defaults.limit,
  };
}
