import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function replyToComment(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.replyToComment(
      args['pageId'] as string,
      args['parentCommentId'] as string,
      args['body'] as string,
    ),
  );
}
