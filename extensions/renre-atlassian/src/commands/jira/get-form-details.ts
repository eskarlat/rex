import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  formId: z.string().min(1),
});

export default async function getFormDetails(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getProformaFormDetails(args.issueKey, args.formId),
  );
}
