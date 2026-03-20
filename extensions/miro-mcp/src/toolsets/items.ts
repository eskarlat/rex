import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition, ToolResult } from './types.js';
import { createHandler } from './types.js';

export function createItemsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_get_items',
      description: 'Get all items on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          query: {
            type: 'object',
            description: 'Optional query parameters (e.g. limit, type, cursor)',
          },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'miro_get_item',
      description: 'Get a specific item by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          itemId: { type: 'string', description: 'Item ID' },
        },
        required: ['boardId', 'itemId'],
      },
    },
    {
      name: 'miro_update_item_position',
      description: 'Update the position of an item on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          itemId: { type: 'string', description: 'Item ID' },
          data: { type: 'object', description: 'Position data (e.g. { position: { x, y } })' },
        },
        required: ['boardId', 'itemId', 'data'],
      },
    },
    {
      name: 'miro_delete_item',
      description: 'Delete an item from a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          itemId: { type: 'string', description: 'Item ID' },
        },
        required: ['boardId', 'itemId'],
      },
    },
  ];

  const handlers: Record<string, (args: Record<string, unknown>) => Promise<ToolResult>> = {
    miro_get_items: createHandler((args) =>
      client.getItems(
        args['boardId'] as string,
        args['query'] as Record<string, unknown> | undefined,
      ),
    ),
    miro_get_item: createHandler((args) =>
      client.getItem(args['boardId'] as string, args['itemId'] as string),
    ),
    miro_update_item_position: createHandler((args) =>
      client.updateItemPosition(
        args['boardId'] as string,
        args['itemId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_delete_item: createHandler((args) =>
      client.deleteItem(args['boardId'] as string, args['itemId'] as string),
    ),
  };

  return { name: 'miro_items', tools, handlers };
}
