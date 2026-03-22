import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function batchCreateVersions(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const projectKey = context.args['projectKey'] as string;
    const versions = context.args['versions'] as Array<Record<string, unknown>>;

    const results = [];
    for (const v of versions) {
      const data = await jira.createVersion({ project: projectKey, ...v });
      results.push(data);
    }

    return toOutput(results);
  } catch (err) {
    return errorOutput(err);
  }
}
