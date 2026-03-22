import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  fields: z.record(z.unknown()).refine(
    (obj) => Object.keys(obj).length > 0,
    'fields must not be empty',
  ),
});

export default async function updateIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.updateIssue(args.issueKey, args.fields);
    return { success: true, issueKey: args.issueKey };
  });
}
