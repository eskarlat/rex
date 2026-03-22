import { jiraCommand } from '../../shared/command-helper.js';
import { buildAdfBody } from '../../shared/adf.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) => {
    const fields: Record<string, unknown> = {
      project: { key: args['projectKey'] as string },
      issuetype: { name: args['issueType'] as string },
      summary: args['summary'] as string,
      ...((args['additionalFields'] as Record<string, unknown>) ?? {}),
    };
    if (args['description']) fields.description = buildAdfBody(args['description'] as string);
    return jira.createIssue(fields);
  });
}
