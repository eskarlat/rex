import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    formId: z.string().min(1),
    answers: z.record(z.unknown()),
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    await jira.updateProformaFormAnswers(args.issueKey, args.formId, args.answers);
    return { success: true };
  }),
});
