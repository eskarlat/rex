import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createTagsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_list_tags',
      description: 'List tags on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'miro_create_tag',
      description: 'Create a tag on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          data: {
            type: 'object',
            description: 'Tag data (title, fillColor)',
          },
        },
        required: ['boardId', 'data'],
      },
    },
    {
      name: 'miro_get_tag',
      description: 'Get a tag by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          tagId: { type: 'string', description: 'Tag ID' },
        },
        required: ['boardId', 'tagId'],
      },
    },
    {
      name: 'miro_update_tag',
      description: 'Update a tag.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          tagId: { type: 'string', description: 'Tag ID' },
          data: { type: 'object', description: 'Updated tag data' },
        },
        required: ['boardId', 'tagId', 'data'],
      },
    },
    {
      name: 'miro_delete_tag',
      description: 'Delete a tag.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          tagId: { type: 'string', description: 'Tag ID' },
        },
        required: ['boardId', 'tagId'],
      },
    },
    {
      name: 'miro_attach_tag',
      description: 'Attach a tag to an item.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          itemId: { type: 'string', description: 'Item ID' },
          tagId: { type: 'string', description: 'Tag ID' },
        },
        required: ['boardId', 'itemId', 'tagId'],
      },
    },
    {
      name: 'miro_detach_tag',
      description: 'Detach a tag from an item.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          itemId: { type: 'string', description: 'Item ID' },
          tagId: { type: 'string', description: 'Tag ID' },
        },
        required: ['boardId', 'itemId', 'tagId'],
      },
    },
    {
      name: 'miro_get_item_tags',
      description: 'Get tags on an item.',
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

  const handlers = {
    miro_list_tags: createHandler((args) => client.listTags(args['boardId'] as string)),
    miro_create_tag: createHandler((args) =>
      client.createTag(args['boardId'] as string, args['data'] as Record<string, unknown>),
    ),
    miro_get_tag: createHandler((args) =>
      client.getTag(args['boardId'] as string, args['tagId'] as string),
    ),
    miro_update_tag: createHandler((args) =>
      client.updateTag(
        args['boardId'] as string,
        args['tagId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_delete_tag: createHandler((args) =>
      client.deleteTag(args['boardId'] as string, args['tagId'] as string),
    ),
    miro_attach_tag: createHandler((args) =>
      client.attachTag(
        args['boardId'] as string,
        args['itemId'] as string,
        args['tagId'] as string,
      ),
    ),
    miro_detach_tag: createHandler((args) =>
      client.detachTag(
        args['boardId'] as string,
        args['itemId'] as string,
        args['tagId'] as string,
      ),
    ),
    miro_get_item_tags: createHandler((args) =>
      client.getItemTags(args['boardId'] as string, args['itemId'] as string),
    ),
  };

  return { name: 'miro_tags', tools, handlers };
}
