import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function replyToComment(context: ExecutionContext): Promise<CommandResult> {
  try {
    const { confluence } = createClients(context);
    const pageId = context.args['pageId'] as string;
    const parentCommentId = context.args['parentCommentId'] as string;
    const body = context.args['body'] as string;
    const data = await confluence.replyToComment(pageId, parentCommentId, body);
    return toOutput(data);
  } catch (err) {
    return errorOutput(err);
  }
}
