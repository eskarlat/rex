import { confluenceCommand, confluencePaginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getPageChildren(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const { start, limit } = confluencePaginationArgs(args);
    return confluence.getPageChildren(args['pageId'] as string, limit, start);
  });
}
