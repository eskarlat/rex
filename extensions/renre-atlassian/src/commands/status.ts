import { createClients } from '../shared/client.js';
import { toOutput, errorOutput } from '../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../shared/types.js';

export default async function status(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const user = await jira.getMyself();
    return toOutput({
      connected: true,
      user,
      domain: context.config['domain'],
      jiraCommands: 50,
      confluenceCommands: 23,
      totalCommands: 75,
    });
  } catch (err) {
    return errorOutput(err);
  }
}
