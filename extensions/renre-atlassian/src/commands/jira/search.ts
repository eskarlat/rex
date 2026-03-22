import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { paginationSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  jql: z.string().min(1, 'JQL query is required'),
  fields: z.array(z.string()).optional(),
}).merge(paginationSchema);

export default async function search(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.search(args.jql, args.startAt, args.maxResults, args.fields),
  );
}
