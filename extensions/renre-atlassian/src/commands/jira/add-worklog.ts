import { z, defineCommand } from '@renre-kit/extension-sdk/node';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
    timeSpent: z.string().min(1),
    comment: z.string().optional(),
    started: z.string().optional(),
  },
  handler: (ctx) =>
    jiraCommand(ctx, (jira, args) => {
    const worklog: Record<string, unknown> = { timeSpent: args.timeSpent };
    if (args.comment) worklog.comment = buildAdfBody(args.comment);
    if (args.started) worklog.started = args.started;
    return jira.addWorklog(args.issueKey, worklog);
  }),
});
