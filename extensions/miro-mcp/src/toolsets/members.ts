import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createMembersToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_list_board_members',
      description: 'List members of a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['boardId'],
      },
    },
    {
      name: 'miro_get_board_member',
      description: 'Get a board member by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          memberId: { type: 'string', description: 'Member ID' },
        },
        required: ['boardId', 'memberId'],
      },
    },
    {
      name: 'miro_update_board_member',
      description: 'Update a board member role.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          memberId: { type: 'string', description: 'Member ID' },
          data: { type: 'object', description: 'Updated member data (e.g. role)' },
        },
        required: ['boardId', 'memberId', 'data'],
      },
    },
    {
      name: 'miro_remove_board_member',
      description: 'Remove a member from a board.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          memberId: { type: 'string', description: 'Member ID' },
        },
        required: ['boardId', 'memberId'],
      },
    },
    {
      name: 'miro_share_board',
      description: 'Share a board with users.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          data: {
            type: 'object',
            description: 'Share data (emails, role)',
          },
        },
        required: ['boardId', 'data'],
      },
    },
  ];

  const handlers = {
    miro_list_board_members: createHandler((args) =>
      client.listBoardMembers(args['boardId'] as string),
    ),
    miro_get_board_member: createHandler((args) =>
      client.getBoardMember(args['boardId'] as string, args['memberId'] as string),
    ),
    miro_update_board_member: createHandler((args) =>
      client.updateBoardMember(
        args['boardId'] as string,
        args['memberId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_remove_board_member: createHandler((args) =>
      client.removeBoardMember(args['boardId'] as string, args['memberId'] as string),
    ),
    miro_share_board: createHandler((args) =>
      client.shareBoard(args['boardId'] as string, args['data'] as Record<string, unknown>),
    ),
  };

  return { name: 'miro_members', tools, handlers };
}
