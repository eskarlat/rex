import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function batchCreateIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.bulkCreateIssues(args['issues'] as Array<{ fields: Record<string, unknown> }>),
  );
}
