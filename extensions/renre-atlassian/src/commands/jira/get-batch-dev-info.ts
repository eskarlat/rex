import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueIds: z.array(z.string()).min(1),
  applicationType: z.string().optional(),
  dataType: z.string().optional(),
});

export default async function getBatchDevInfo(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getBatchDevelopmentInfo(args.issueIds, args.applicationType, args.dataType),
  );
}
