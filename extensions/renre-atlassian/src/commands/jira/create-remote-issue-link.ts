import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createRemoteIssueLink(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const url = context.args['url'] as string;
    const title = context.args['title'] as string;

    const link = {
      object: { url, title },
    };

    const data = await jira.createRemoteIssueLink(issueKey, link);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
