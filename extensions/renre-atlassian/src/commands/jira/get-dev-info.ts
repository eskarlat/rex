import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueId: z.string().min(1),
  applicationType: z.string().optional(),
  dataType: z.string().optional(),
});

export default async function getDevInfo(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getDevelopmentInfo(args.issueId, args.applicationType, args.dataType),
  );
}
