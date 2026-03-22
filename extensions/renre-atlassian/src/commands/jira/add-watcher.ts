import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addWatcher(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const accountId = context.args['accountId'] as string;
    await jira.addWatcher(issueKey, accountId);
    return toOutput({ success: true });
  } catch (err) {
    return errorOutput(err);
  }
}
