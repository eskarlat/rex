import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function createRemoteIssueLink(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.createRemoteIssueLink(args['issueKey'] as string, {
      object: { url: args['url'] as string, title: args['title'] as string },
    }),
  );
}
