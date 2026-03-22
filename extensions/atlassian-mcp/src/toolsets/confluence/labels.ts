import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { safeExec, pageIdSchema } from '../types.js';

export function createLabelsToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_labels',
    tools: [
      {
        name: 'confluence_get_labels',
        description: 'Get labels on a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: { ...pageIdSchema },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_add_label',
        description: 'Add labels to a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            ...pageIdSchema,
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
      confluence_get_labels: (args) =>
        safeExec(() => client.getLabels(args['pageId'] as string)),
      confluence_add_label: (args) =>
        safeExec(() =>
          client.addLabel(
            args['pageId'] as string,
            (args['labels'] as string[]).map((name) => ({ name })),
          ),
        ),
    },
  };
}
