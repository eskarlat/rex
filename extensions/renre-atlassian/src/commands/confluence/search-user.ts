import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ query: z.string().min(1) });

export default async function searchUser(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.searchUser(args.query),
  );
}
