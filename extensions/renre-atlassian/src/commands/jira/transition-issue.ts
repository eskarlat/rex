import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function transitionIssue(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const transitionId = context.args['transitionId'] as string;
    await jira.transitionIssue(issueKey, transitionId);
    return toOutput({ success: true, issueKey, transitionId });
  } catch (err) {
    return errorOutput(err);
  }
}
