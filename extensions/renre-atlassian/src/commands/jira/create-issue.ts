import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    projectKey: projectKeySchema,
    issueType: z.string().min(1),
    summary: z.string().min(1),
    description: z.string().optional(),
    additionalFields: z.record(z.unknown()).optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) => {
    const fields: Record<string, unknown> = {
      project: { key: args.projectKey },
      issuetype: { name: args.issueType },
      summary: args.summary,
      ...(args.additionalFields ?? {}),
    };
    if (args.description) fields.description = buildAdfBody(args.description);
    return jira.createIssue(fields);
  }),
});
