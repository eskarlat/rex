import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function removeIssueLink(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const linkId = context.args['linkId'] as string;
    await jira.removeIssueLink(linkId);
    return toOutput({ success: true, linkId });
  } catch (err) {
    return errorOutput(err);
  }
}
