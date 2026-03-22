import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createIssueLink(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const typeName = context.args['typeName'] as string;
    const inwardIssueKey = context.args['inwardIssueKey'] as string;
    const outwardIssueKey = context.args['outwardIssueKey'] as string;

    const link = {
      type: { name: typeName },
      inwardIssue: { key: inwardIssueKey },
      outwardIssue: { key: outwardIssueKey },
    };

    await jira.createIssueLink(link);
    return toOutput({ success: true });
  } catch (err) {
    return errorOutput(err);
  }
}
