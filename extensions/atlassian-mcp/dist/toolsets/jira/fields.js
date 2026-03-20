import { textResult, errorResult } from '../types.js';
export function createFieldsToolset(client) {
    return {
        name: 'jira_fields',
        tools: [
            {
                name: 'jira_search_fields',
                description: 'List all available Jira fields (system and custom).',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'jira_get_field_options',
                description: 'Get available options for a Jira custom field.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        fieldId: { type: 'string', description: 'Field ID (e.g., customfield_10001)' },
                        contextId: { type: 'string', description: 'Field context ID' },
                    },
                    required: ['fieldId', 'contextId'],
                },
            },
        ],
        handlers: {
            jira_search_fields: async () => {
                try {
                    const data = await client.getFields();
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_field_options: async (args) => {
                try {
                    const data = await client.getFieldOptions(args['fieldId'], args['contextId']);
                    return textResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
