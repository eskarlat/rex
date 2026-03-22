import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function batchCreateVersions(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const projectKey = args['projectKey'] as string;
    const versions = args['versions'] as Array<Record<string, unknown>>;
    const results = [];
    for (const v of versions) {
      results.push(await jira.createVersion({ project: projectKey, ...v }));
    }
    return results;
  });
}
