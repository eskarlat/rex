import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getProjectIssues(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const data = await jira.search(
      `project = ${context.args['projectKey'] as string} ORDER BY updated DESC`,
      (context.args['startAt'] as number | undefined) ?? 0,
      (context.args['maxResults'] as number | undefined) ?? 50,
    );
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
