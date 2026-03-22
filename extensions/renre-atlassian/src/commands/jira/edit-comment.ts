import { z } from 'zod';

import { buildAdfBody } from '../../shared/adf.js';
import { jiraCommand } from '../../shared/command-helper.js';
import { issueKeySchema } from '../../shared/schemas.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

const schema = z.object({
  issueKey: issueKeySchema,
  commentId: z.string().min(1),
  body: z.string().min(1),
});

export default async function editComment(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, schema, (jira, args) =>
    jira.editComment(args.issueKey, args.commentId, buildAdfBody(args.body)),
  );
}
