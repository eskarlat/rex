import { createHandler } from './types.js';
export function createBulkToolset(client) {
    const tools = [
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
    const handlers = {
        miro_create_items_in_bulk: createHandler((args) => client.createItemsInBulk(args['boardId'], args['items'])),
        miro_create_items_in_bulk_using_file: createHandler((args) => {
            const formData = new FormData();
            formData.append('url', args['fileUrl']);
            return client.createItemsInBulkUsingFile(args['boardId'], formData);
        }),
    };
    return { name: 'miro_bulk', tools, handlers };
}
