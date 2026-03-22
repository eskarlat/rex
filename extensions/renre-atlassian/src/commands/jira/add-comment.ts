import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function addComment(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { jira } = createClients(context);
    const issueKey = context.args['issueKey'] as string;
    const body = context.args['body'] as string;
    const adfBody = {
      type: 'doc',
      version: 1,
      content: [
        {
          type: 'paragraph',
          content: [{ type: 'text', text: body }],
        },
      ],
    };
    const data = await jira.addComment(issueKey, adfBody);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
