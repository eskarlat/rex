import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issues: z.array(z.object({ fields: z.record(z.unknown()) })).min(1),
});

export default async function batchCreateIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => jira.bulkCreateIssues(args.issues));
}
