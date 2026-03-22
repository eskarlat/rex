import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function linkToEpic(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const epicKey = context.args['epicKey'] as string;
    const issueKeys = context.args['issueKeys'] as string[];
    await jira.linkToEpic(epicKey, issueKeys);
    return toOutput({ success: true });
  } catch (err) {
    return errorOutput(err);
  }
}
