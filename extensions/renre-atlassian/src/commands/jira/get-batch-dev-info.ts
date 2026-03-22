import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getBatchDevInfo(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.getBatchDevelopmentInfo(
      context.args['issueIds'] as string[],
      context.args['applicationType'] as string | undefined,
      context.args['dataType'] as string | undefined,
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
