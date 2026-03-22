import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  serviceDeskId: z.coerce.number().int().positive(),
});

export default async function getServiceDeskQueues(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getServiceDeskQueues(args.serviceDeskId),
  );
}
