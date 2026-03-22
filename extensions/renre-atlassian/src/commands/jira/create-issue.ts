import { z } from 'zod';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  projectKey: projectKeySchema,
  issueType: z.string().min(1),
  summary: z.string().min(1),
  description: z.string().optional(),
  additionalFields: z.record(z.unknown()).optional(),
});

export default async function createIssue(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => {
    const fields: Record<string, unknown> = {
      project: { key: args.projectKey },
      issuetype: { name: args.issueType },
      summary: args.summary,
      ...(args.additionalFields ?? {}),
    };
    if (args.description) fields.description = buildAdfBody(args.description);
    return jira.createIssue(fields);
  });
}
