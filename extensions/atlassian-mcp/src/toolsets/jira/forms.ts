import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { textResult, errorResult } from '../types.js';

export function createFormsToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_forms',
    tools: [
      {
        name: 'jira_get_issue_proforma_forms',
        description: 'Get all Proforma forms attached to a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
          },
          required: ['issueKey'],
        },
      },
      {
        name: 'jira_get_proforma_form_details',
        description: 'Get details of a specific Proforma form on a Jira issue.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            formId: { type: 'string', description: 'Form ID' },
          },
          required: ['issueKey', 'formId'],
        },
      },
      {
        name: 'jira_update_proforma_form_answers',
        description: 'Update answers on a Proforma form.',
        inputSchema: {
          type: 'object',
          properties: {
            issueKey: { type: 'string', description: 'Issue key' },
            formId: { type: 'string', description: 'Form ID' },
            answers: { type: 'object', description: 'Form field answers' },
          },
          required: ['issueKey', 'formId', 'answers'],
        },
      },
    ],
    handlers: {
      jira_get_issue_proforma_forms: async (args) => {
        try {
          const data = await client.getIssueProformaForms(args['issueKey'] as string);
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_proforma_form_details: async (args) => {
        try {
          const data = await client.getProformaFormDetails(
            args['issueKey'] as string,
            args['formId'] as string,
          );
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_update_proforma_form_answers: async (args) => {
        try {
          const data = await client.updateProformaFormAnswers(
            args['issueKey'] as string,
            args['formId'] as string,
            args['answers'] as Record<string, unknown>,
          );
          return textResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
