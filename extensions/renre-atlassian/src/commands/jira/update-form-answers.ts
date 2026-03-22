import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  formId: z.string().min(1),
  answers: z.record(z.unknown()),
});

export default async function updateFormAnswers(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    await jira.updateProformaFormAnswers(args.issueKey, args.formId, args.answers);
    return { success: true };
  });
}
