import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { confluencePaginationSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z
  .object({ cql: z.string().min(1, 'CQL query is required') })
  .merge(confluencePaginationSchema);

export default async function search(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.search(args.cql, args.limit, args.start),
  );
}
