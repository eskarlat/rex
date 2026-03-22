import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  linkId: z.string().min(1),
});

export default async function removeIssueLink(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.removeIssueLink(args.linkId);
    return { success: true, linkId: args.linkId };
  });
}
