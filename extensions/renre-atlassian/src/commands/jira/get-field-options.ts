import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getFieldOptions(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getFieldOptions(args['fieldId'] as string, args['contextId'] as string),
  );
}
