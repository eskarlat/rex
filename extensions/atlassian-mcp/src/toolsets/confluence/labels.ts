import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createLabelsToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_labels',
    tools: [
      {
        name: 'confluence_get_labels',
        description: 'Get labels on a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_add_label',
        description: 'Add labels to a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            labels: {
              type: 'array',
              items: { type: 'string' },
              description: 'Label names to add',
            },
          },
          required: ['pageId', 'labels'],
        },
      },
    ],
    handlers: {
      confluence_get_labels: async (args) => {
        try {
          const data = await client.getLabels(args['pageId'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      confluence_add_label: async (args) => {
        try {
          const labels = (args['labels'] as string[]).map((name) => ({ name }));
          const data = await client.addLabel(args['pageId'] as string, labels);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
