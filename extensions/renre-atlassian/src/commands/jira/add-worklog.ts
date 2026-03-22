import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addWorklog(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const timeSpent = context.args['timeSpent'] as string;
    const comment = context.args['comment'] as string | undefined;
    const started = context.args['started'] as string | undefined;

    const worklog: Record<string, unknown> = { timeSpent };
    if (comment) {
      worklog.comment = {
        type: 'doc',
        version: 1,
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: comment }],
          },
        ],
      };
    }
    if (started) worklog.started = started;

    const data = await jira.addWorklog(issueKey, worklog);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
