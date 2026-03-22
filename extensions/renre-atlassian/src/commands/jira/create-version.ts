import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createVersion(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const projectKey = context.args['projectKey'] as string;
    const name = context.args['name'] as string;
    const description = context.args['description'] as string | undefined;
    const releaseDate = context.args['releaseDate'] as string | undefined;

    const version: Record<string, unknown> = { project: projectKey, name };
    if (description) version.description = description;
    if (releaseDate) version.releaseDate = releaseDate;

    const data = await jira.createVersion(version);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
