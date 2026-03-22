import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  typeName: z.string().min(1),
  inwardIssueKey: z.string().min(1),
  outwardIssueKey: z.string().min(1),
});

export default async function createIssueLink(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.createIssueLink({
      type: { name: args.typeName },
      inwardIssue: { key: args.inwardIssueKey },
      outwardIssue: { key: args.outwardIssueKey },
    });
    return { success: true };
  });
}
