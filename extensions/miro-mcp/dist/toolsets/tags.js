import { createHandler } from './types.js';
export function createTagsToolset(client) {
    const tools = [
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
        miro_list_tags: createHandler((args) => client.listTags(args['boardId'])),
        miro_create_tag: createHandler((args) => client.createTag(args['boardId'], args['data'])),
        miro_get_tag: createHandler((args) => client.getTag(args['boardId'], args['tagId'])),
        miro_update_tag: createHandler((args) => client.updateTag(args['boardId'], args['tagId'], args['data'])),
        miro_delete_tag: createHandler((args) => client.deleteTag(args['boardId'], args['tagId'])),
        miro_attach_tag: createHandler((args) => client.attachTag(args['boardId'], args['itemId'], args['tagId'])),
        miro_detach_tag: createHandler((args) => client.detachTag(args['boardId'], args['itemId'], args['tagId'])),
        miro_get_item_tags: createHandler((args) => client.getItemTags(args['boardId'], args['itemId'])),
    };
    return { name: 'miro_tags', tools, handlers };
}
