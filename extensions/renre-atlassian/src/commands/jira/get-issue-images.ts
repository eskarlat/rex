import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getIssueImages(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    const data = await jira.getIssueForAttachments(args['issueKey'] as string);
    const attachments = (data as Record<string, unknown>)['attachments'] as
      | Array<Record<string, unknown>>
      | undefined;
    return (attachments ?? []).filter((a) => {
      const mimeType = a['mimeType'] as string | undefined;
      return mimeType?.startsWith('image/');
    });
  });
}
