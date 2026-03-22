import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createVersion(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const version: Record<string, unknown> = {
      project: args['projectKey'] as string,
      name: args['name'] as string,
    };
    if (args['description']) version.description = args['description'];
    if (args['releaseDate']) version.releaseDate = args['releaseDate'];
    return jira.createVersion(version);
  });
}
