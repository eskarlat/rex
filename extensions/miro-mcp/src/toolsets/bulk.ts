import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition, ToolResult } from './types.js';
import { createHandler } from './types.js';

export function createBulkToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_create_items_in_bulk',
      description: 'Create multiple items on a board in a single request.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          items: {
            type: 'array',
            description: 'Array of item objects to create',
          },
        },
        required: ['boardId', 'items'],
      },
    },
    {
      name: 'miro_create_items_in_bulk_using_file',
      description: 'Create multiple items on a board from a file URL.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          fileUrl: { type: 'string', description: 'URL of the file containing items data' },
        },
        required: ['boardId', 'fileUrl'],
      },
    },
  ];

  const handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>> = {
    miro_create_items_in_bulk: createHandler((args) =>
      client.createItemsInBulk(args['boardId'] as string, args['items'] as unknown[]),
    ),
    miro_create_items_in_bulk_using_file: createHandler((args) => {
      const formData = new FormData();
      formData.append('url', args['fileUrl'] as string);
      return client.createItemsInBulkUsingFile(args['boardId'] as string, formData);
    }),
  };

  return { name: 'miro_bulk', tools, handlers };
}
