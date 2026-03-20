import { createHandler } from './types.js';
export function createItemsToolset(client) {
    const tools = [
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
    const handlers = {
        miro_get_items: createHandler((args) => client.getItems(args['boardId'], args['query'])),
        miro_get_item: createHandler((args) => client.getItem(args['boardId'], args['itemId'])),
        miro_update_item_position: createHandler((args) => client.updateItemPosition(args['boardId'], args['itemId'], args['data'])),
        miro_delete_item: createHandler((args) => client.deleteItem(args['boardId'], args['itemId'])),
    };
    return { name: 'miro_items', tools, handlers };
}
