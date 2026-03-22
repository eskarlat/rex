import { jiraCommand } from '../../shared/command-helper.js';
import type { ExecutionContext, CommandResult } from '../../shared/types.js';

export default async function getIssueForms(context: ExecutionContext): Promise<CommandResult> {
  return jiraCommand(context, (jira, args) =>
    jira.getIssueProformaForms(args['issueKey'] as string),
  );
}
