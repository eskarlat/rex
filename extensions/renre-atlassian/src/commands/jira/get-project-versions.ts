import { z } from 'zod';

import { jiraCommand } from '../../shared/command-helper.js';
import { projectKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  projectKey: projectKeySchema,
});

export default async function getProjectVersions(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.getProjectVersions(args.projectKey),
  );
}
