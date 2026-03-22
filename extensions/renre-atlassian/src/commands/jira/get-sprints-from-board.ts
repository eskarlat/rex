import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { boardIdSchema, paginationSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  boardId: boardIdSchema,
}).merge(paginationSchema);

export default async function getSprintsFromBoard(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getSprintsFromBoard(args.boardId, args.startAt, args.maxResults),
  );
}
