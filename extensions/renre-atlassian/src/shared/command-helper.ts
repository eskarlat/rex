import type { z, ZodType } from 'zod';
import { ZodError } from 'zod';

import type { JiraClient } from '../client/jira-client.js';
import type { ConfluenceClient } from '../client/confluence-client.js';

import { createClients } from './client.js';
import { toOutput, errorOutput } from './formatters.js';
import type { ExecutionContext, CommandResult } from './types.js';

function formatZodError(err: ZodError): string {
  return err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
}

/** Wrap a Jira command handler with Zod validation + createClients + toOutput + errorOutput */
export async function jiraCommand<T extends ZodType>(
  context: ExecutionContext,
  schema: T,
  fn: (jira: JiraClient, args: z.infer<T>) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const parsed = schema.parse(context.args);
    const { jira } = createClients(context);
    const data = await fn(jira, parsed);
    return toOutput(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return errorOutput(new Error(`Invalid arguments: ${formatZodError(err)}`));
    }
    return errorOutput(err);
  }
}

/** Wrap a Confluence command handler with Zod validation + createClients + toOutput + errorOutput */
export async function confluenceCommand<T extends ZodType>(
  context: ExecutionContext,
  schema: T,
  fn: (confluence: ConfluenceClient, args: z.infer<T>) => Promise<unknown>,
): Promise<CommandResult> {
  try {
    const parsed = schema.parse(context.args);
    const { confluence } = createClients(context);
    const data = await fn(confluence, parsed);
    return toOutput(data);
  } catch (err) {
    if (err instanceof ZodError) {
      return errorOutput(new Error(`Invalid arguments: ${formatZodError(err)}`));
    }
    return errorOutput(err);
  }
}
