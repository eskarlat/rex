import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({});

export default async function getLinkTypes(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira) => jira.getLinkTypes());
}
