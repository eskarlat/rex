import { jiraCommand } from '../../shared/command-helper.js';
import { buildAdfBody } from '../../shared/adf.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addWorklog(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const worklog: Record<string, unknown> = { timeSpent: args['timeSpent'] as string };
    if (args['comment']) worklog.comment = buildAdfBody(args['comment'] as string);
    if (args['started']) worklog.started = args['started'];
    return jira.addWorklog(args['issueKey'] as string, worklog);
  });
}
