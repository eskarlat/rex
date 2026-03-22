import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function batchCreateIssues(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.bulkCreateIssues(
      context.args['issues'] as Array<{ fields: Record<string, unknown> }>,
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
