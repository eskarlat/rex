import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  transitionId: z.string().min(1),
});

export default async function transitionIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.transitionIssue(args.issueKey, args.transitionId);
    return { success: true, issueKey: args.issueKey, transitionId: args.transitionId };
  });
}
