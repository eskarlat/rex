import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
});

export default async function getIssueImages(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    const data = await jira.getIssueForAttachments(args.issueKey);
    const attachments = (data as Record<string, unknown>)['attachments'] as
      | Array<Record<string, unknown>>
      | undefined;
    return (attachments ?? []).filter((a) => {
      const mimeType = a['mimeType'] as string | undefined;
      return mimeType?.startsWith('image/');
    });
  });
}
