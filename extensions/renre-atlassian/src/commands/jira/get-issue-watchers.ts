import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getIssueWatchers(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.getWatchers(context.args['issueKey'] as string);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
