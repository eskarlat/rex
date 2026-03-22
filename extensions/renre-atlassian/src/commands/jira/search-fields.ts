import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({});

export default async function searchFields(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira) => jira.getFields());
}
