import { defineCommand } from '@renre-kit/extension-sdk/node';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';

export default defineCommand({
  args: {
    issueKey: issueKeySchema,
  },
  handler: (ctx) =>
    jiraCommand(ctx, async (jira, args) => {
    const data = await jira.getIssueForAttachments(args.issueKey);
    const attachments = (data as Record<string, unknown>)['attachments'] as
      | Array<Record<string, unknown>>
      | undefined;
    return (attachments ?? []).filter((a) => {
      const mimeType = a['mimeType'] as string | undefined;
      return mimeType?.startsWith('image/');
    });
  }),
});
