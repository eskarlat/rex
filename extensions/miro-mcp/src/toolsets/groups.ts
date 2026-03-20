import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createGroupsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_list_groups',
      description: 'List groups on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'miro_get_group',
      description: 'Get a group by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          groupId: { type: 'string', description: 'Group ID' },
        },
        required: ['boardId', 'groupId'],
      },
    },
    {
      name: 'miro_create_group',
      description: 'Create a group on a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          data: { type: 'object', description: 'Group data (items to group, etc.)' },
        },
        required: ['boardId', 'data'],
      },
    },
    {
      name: 'miro_update_group',
      description: 'Update a group.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          groupId: { type: 'string', description: 'Group ID' },
          data: { type: 'object', description: 'Updated group data' },
        },
        required: ['boardId', 'groupId', 'data'],
      },
    },
    {
      name: 'miro_delete_group',
      description: 'Delete a group.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          groupId: { type: 'string', description: 'Group ID' },
        },
        required: ['boardId', 'groupId'],
      },
    },
    {
      name: 'miro_get_group_items',
      description: 'Get items in a group.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          groupId: { type: 'string', description: 'Group ID' },
        },
        required: ['boardId', 'groupId'],
      },
    },
    {
      name: 'miro_ungroup_items',
      description: 'Ungroup all items in a group.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          groupId: { type: 'string', description: 'Group ID' },
        },
        required: ['boardId', 'groupId'],
      },
    },
  ];

  const handlers = {
    miro_list_groups: createHandler((args) =>
      client.listGroups(args['boardId'] as string),
    ),
    miro_get_group: createHandler((args) =>
      client.getGroup(args['boardId'] as string, args['groupId'] as string),
    ),
    miro_create_group: createHandler((args) =>
      client.createGroup(args['boardId'] as string, args['data'] as Record<string, unknown>),
    ),
    miro_update_group: createHandler((args) =>
      client.updateGroup(
        args['boardId'] as string,
        args['groupId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_delete_group: createHandler((args) =>
      client.deleteGroup(args['boardId'] as string, args['groupId'] as string),
    ),
    miro_get_group_items: createHandler((args) =>
      client.getGroupItems(args['boardId'] as string, args['groupId'] as string),
    ),
    miro_ungroup_items: createHandler((args) =>
      client.ungroupItems(args['boardId'] as string, args['groupId'] as string),
    ),
  };

  return { name: 'miro_groups', tools, handlers };
}
