import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { paginationSchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = paginationSchema;

export default async function getAgileBoards(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getBoards(args.startAt, args.maxResults),
  );
}
