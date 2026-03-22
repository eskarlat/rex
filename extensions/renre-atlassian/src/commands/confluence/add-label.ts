import { z } from 'zod';
import { confluenceCommand } from '../../shared/command-helper.js';
import { pageIdSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({ pageId: pageIdSchema, labels: z.array(z.string()).min(1) });

export default async function addLabel(context: ExecutionContext): Promise<CommandResult> {
  return confluenceCommand(context, schema, (confluence, args) =>
    confluence.addLabel(
      args.pageId,
      args.labels.map((name) => ({ name })),
    ),
  );
}
