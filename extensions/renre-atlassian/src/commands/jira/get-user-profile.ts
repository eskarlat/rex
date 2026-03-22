import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getUserProfile(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const accountId = context.args['accountId'] as string | undefined;
    const data = accountId ? await jira.getUser(accountId) : await jira.getMyself();
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
