import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function downloadAttachment(
  context: ExecutionContext,
): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const attachmentId = context.args['attachmentId'] as string;
    const res = await jira.downloadAttachment(attachmentId);
    const text = await res.text();
    return toOutput({ attachmentId, content: text });
  } catch (err) {
    return errorOutput(err);
  }
}
