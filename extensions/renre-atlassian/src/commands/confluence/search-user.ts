import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function searchUser(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, (confluence, args) =>
    confluence.searchUser(args['query'] as string),
  );
}
