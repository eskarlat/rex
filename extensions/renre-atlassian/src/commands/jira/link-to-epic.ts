import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  epicKey: z.string().min(1),
  issueKeys: z.array(z.string()).min(1),
});

export default async function linkToEpic(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.linkToEpic(args.epicKey, args.issueKeys);
    return { success: true };
  });
}
