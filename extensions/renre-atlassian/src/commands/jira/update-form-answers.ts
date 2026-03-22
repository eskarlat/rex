import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function updateFormAnswers(
  context: ExecutionContext,
): Promise<CommandResult> {
  return jiraCommand(context, async (jira, args) => {
    await jira.updateProformaFormAnswers(
      args['issueKey'] as string,
      args['formId'] as string,
      args['answers'] as Record<string, unknown>,
    );
    return { success: true };
  });
}
