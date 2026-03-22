import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  fieldId: z.string().min(1),
  contextId: z.string().min(1),
});

export default async function getFieldOptions(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getFieldOptions(args.fieldId, args.contextId),
  );
}
