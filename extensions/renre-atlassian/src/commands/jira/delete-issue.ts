import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function deleteIssue(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    await jira.deleteIssue(issueKey);
    return toOutput({ success: true, issueKey });
  } catch (err) {
    return errorOutput(err);
  }
}
