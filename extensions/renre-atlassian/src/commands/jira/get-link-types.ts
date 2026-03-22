import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getLinkTypes(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira) => jira.getLinkTypes());
}
