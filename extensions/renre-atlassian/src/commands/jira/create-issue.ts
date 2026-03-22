import { buildAdfBody } from '../../shared/adf.js';
import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createIssue(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const projectKey = context.args['projectKey'] as string;
    const issueType = context.args['issueType'] as string;
    const summary = context.args['summary'] as string;
    const description = context.args['description'] as string | undefined;
    const additionalFields = (context.args['additionalFields'] as Record<string, unknown>) ?? {};

    const fields: Record<string, unknown> = {
      project: { key: projectKey },
      issuetype: { name: issueType },
      summary,
      ...additionalFields,
    };

    if (description) fields.description = buildAdfBody(description);

    const data = await jira.createIssue(fields);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
