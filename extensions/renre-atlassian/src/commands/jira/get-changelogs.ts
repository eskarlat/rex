import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  startAt: z.coerce.number().int().min(0).default(0),
  maxResults: z.coerce.number().int().min(1).max(100).default(100),
});

export default async function getChangelogs(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getChangelogs(args.issueKey, args.startAt, args.maxResults),
  );
}
