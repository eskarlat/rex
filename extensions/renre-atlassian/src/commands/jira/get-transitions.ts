import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
});

export default async function getTransitions(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => jira.getTransitions(args.issueKey));
}
