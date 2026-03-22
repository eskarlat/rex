import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { confluencePaginationSchema, pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ pageId: pageIdSchema }).merge(confluencePaginationSchema);

export default async function getAttachments(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.getAttachments(args.pageId, args.limit, args.start),
  );
}
