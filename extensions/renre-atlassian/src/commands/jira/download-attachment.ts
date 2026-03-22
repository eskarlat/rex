import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const attachmentId = args['attachmentId'] as string;
    const res = await jira.downloadAttachment(attachmentId);
    const text = await res.text();
    return { attachmentId, content: text };
  });
}
