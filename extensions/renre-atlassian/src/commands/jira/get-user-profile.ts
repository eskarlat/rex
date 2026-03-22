import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  accountId: z.string().optional(),
});

export default async function getUserProfile(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    args.accountId ? jira.getUser(args.accountId) : jira.getMyself(),
  );
}
