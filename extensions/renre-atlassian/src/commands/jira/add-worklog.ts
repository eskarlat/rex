import { z } from 'zod';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  timeSpent: z.string().min(1),
  comment: z.string().optional(),
  started: z.string().optional(),
});

export default async function addWorklog(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => {
    const worklog: Record<string, unknown> = { timeSpent: args.timeSpent };
    if (args.comment) worklog.comment = buildAdfBody(args.comment);
    if (args.started) worklog.started = args.started;
    return jira.addWorklog(args.issueKey, worklog);
  });
}
