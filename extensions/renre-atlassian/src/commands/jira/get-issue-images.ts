import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getIssueImages(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const data = await jira.getIssueForAttachments(issueKey);
    const attachments = (data as Record<string, unknown>)['attachments'] as
      | Array<Record<string, unknown>>
      | undefined;
    const images = (attachments ?? []).filter((a) => {
      const mimeType = a['mimeType'] as string | undefined;
      return mimeType?.startsWith('image/');
    });
    return toOutput(images);
  } catch (err) {
    return errorOutput(err);
  }
}
