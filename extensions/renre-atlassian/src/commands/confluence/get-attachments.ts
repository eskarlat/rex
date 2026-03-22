import { confluenceCommand, confluencePaginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getAttachments(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const { start, limit } = confluencePaginationArgs(args);
    return confluence.getAttachments(args['pageId'] as string, limit, start);
  });
}
