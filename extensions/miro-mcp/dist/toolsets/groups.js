import { createHandler } from './types.js';
export function createGroupsToolset(client) {
    const tools = [
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
        miro_list_groups: createHandler((args) => client.listGroups(args['boardId'])),
        miro_get_group: createHandler((args) => client.getGroup(args['boardId'], args['groupId'])),
        miro_create_group: createHandler((args) => client.createGroup(args['boardId'], args['data'])),
        miro_update_group: createHandler((args) => client.updateGroup(args['boardId'], args['groupId'], args['data'])),
        miro_delete_group: createHandler((args) => client.deleteGroup(args['boardId'], args['groupId'])),
        miro_get_group_items: createHandler((args) => client.getGroupItems(args['boardId'], args['groupId'])),
        miro_ungroup_items: createHandler((args) => client.ungroupItems(args['boardId'], args['groupId'])),
    };
    return { name: 'miro_groups', tools, handlers };
}
