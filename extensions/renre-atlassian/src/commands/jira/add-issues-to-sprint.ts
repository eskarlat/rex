import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { sprintIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  sprintId: sprintIdSchema,
  issueKeys: z.array(z.string()).min(1),
});

export default async function addIssuesToSprint(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.addIssuesToSprint(args.sprintId, args.issueKeys);
    return { success: true, sprintId: args.sprintId, issueKeys: args.issueKeys };
  });
}
