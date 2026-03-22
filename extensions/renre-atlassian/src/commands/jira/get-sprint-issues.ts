import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { paginationSchema, sprintIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  sprintId: sprintIdSchema,
}).merge(paginationSchema);

export default async function getSprintIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getSprintIssues(args.sprintId, args.startAt, args.maxResults),
  );
}
