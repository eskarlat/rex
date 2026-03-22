import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    formId: z.string().min(1),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) =>
    jira.getProformaFormDetails(args.issueKey, args.formId),),
});
