import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  projectKey: projectKeySchema,
  name: z.string().min(1),
  description: z.string().optional(),
  releaseDate: z.string().optional(),
});

export default async function createVersion(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) => {
    const version: Record<string, unknown> = {
      project: args.projectKey,
      name: args.name,
    };
    if (args.description) version.description = args.description;
    if (args.releaseDate) version.releaseDate = args.releaseDate;
    return jira.createVersion(version);
  });
}
