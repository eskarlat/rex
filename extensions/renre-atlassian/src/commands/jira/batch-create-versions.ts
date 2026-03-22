import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  projectKey: projectKeySchema,
  versions: z.array(z.record(z.unknown())).min(1),
});

export default async function batchCreateVersions(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, async (jira, args) => {
    const results = [];
    for (const v of args.versions) {
      results.push(await jira.createVersion({ project: args.projectKey, ...v }));
    }
    return results;
  });
}
