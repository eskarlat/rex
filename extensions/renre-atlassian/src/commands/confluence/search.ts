import { confluenceCommand, confluencePaginationArgs } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function search(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) => {
    const { start, limit } = confluencePaginationArgs(args);
    return confluence.search(args['cql'] as string, limit, start);
  });
}
