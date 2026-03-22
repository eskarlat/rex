import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getUserProfile(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const accountId = args['accountId'] as string | undefined;
    return accountId ? jira.getUser(accountId) : jira.getMyself();
  });
}
