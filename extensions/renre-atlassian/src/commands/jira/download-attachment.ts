import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  attachmentId: z.string().min(1),
});

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    const res = await jira.downloadAttachment(args.attachmentId);
    const text = await res.text();
    return { attachmentId: args.attachmentId, content: text };
  });
}
