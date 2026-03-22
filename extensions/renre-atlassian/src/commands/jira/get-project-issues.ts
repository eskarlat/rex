import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { paginationSchema, projectKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  projectKey: projectKeySchema,
}).merge(paginationSchema);

export default async function getProjectIssues(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.search(
      `project = ${args.projectKey} ORDER BY updated DESC`,
      args.startAt,
      args.maxResults,
    ),
  );
}
