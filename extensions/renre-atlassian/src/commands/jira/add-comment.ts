import { jiraCommand } from '../../shared/command-helper.js';
import { buildAdfBody } from '../../shared/adf.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addComment(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.addComment(args['issueKey'] as string, buildAdfBody(args['body'] as string)),
  );
}
