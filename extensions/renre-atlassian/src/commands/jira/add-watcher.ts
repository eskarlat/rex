import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { accountIdSchema, issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  accountId: accountIdSchema,
});

export default async function addWatcher(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.addWatcher(args.issueKey, args.accountId);
    return { success: true };
  });
}
