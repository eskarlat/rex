import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ pageId: pageIdSchema });

export default async function deletePage(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, async (confluence, args) => {
    await confluence.deletePage(args.pageId);
    return { success: true, pageId: args.pageId };
  });
}
