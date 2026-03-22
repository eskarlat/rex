import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updateIssue(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    await jira.updateIssue(issueKey, context.args['fields'] as Record<string, unknown>);
    return toOutput({ success: true, issueKey });
  } catch (err) {
    return errorOutput(err);
  }
}
