import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  url: z.string().url(),
  title: z.string().min(1),
});

export default async function createRemoteIssueLink(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.createRemoteIssueLink(args.issueKey, {
      object: { url: args.url, title: args.title },
    }),
  );
}
