import { createHandler } from './types.js';
export function createImagesToolset(client) {
    const tools = [
        {
            name: 'miro_create_image_from_url',
            description: 'Create an image on a board from a URL.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    data: {
                        type: 'object',
                        description: 'Image data (url, position, geometry, etc.)',
                    },
                },
                required: ['boardId', 'data'],
            },
        },
        {
            name: 'miro_create_image_from_file',
            description: 'Create an image on a board from file data.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    fileUrl: { type: 'string', description: 'URL of the file to upload' },
                },
                required: ['boardId', 'fileUrl'],
            },
        },
        {
            name: 'miro_get_image',
            description: 'Get an image by ID.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: 'Image item ID' },
                },
                required: ['boardId', 'itemId'],
            },
        },
        {
            name: 'miro_update_image',
            description: 'Update image metadata.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: 'Image item ID' },
                    data: { type: 'object', description: 'Updated image data' },
                },
                required: ['boardId', 'itemId', 'data'],
            },
        },
        {
            name: 'miro_update_image_from_file',
            description: 'Update an image with a new file.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: 'Image item ID' },
                    fileUrl: { type: 'string', description: 'URL of the new file' },
                },
                required: ['boardId', 'itemId', 'fileUrl'],
            },
        },
        {
            name: 'miro_delete_image',
            description: 'Delete an image.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: 'Image item ID' },
                },
                required: ['boardId', 'itemId'],
            },
        },
        {
            name: 'miro_list_images',
            description: 'List all images on a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                },
                required: ['boardId'],
            },
        },
    ];
    const handlers = {
        miro_create_image_from_url: createHandler((args) => client.createImageFromUrl(args['boardId'], args['data'])),
        miro_create_image_from_file: createHandler(async (args) => {
            const formData = new FormData();
            formData.append('url', args['fileUrl']);
            return client.createImageFromFile(args['boardId'], formData);
        }),
        miro_get_image: createHandler((args) => client.getImage(args['boardId'], args['itemId'])),
        miro_update_image: createHandler((args) => client.updateImage(args['boardId'], args['itemId'], args['data'])),
        miro_update_image_from_file: createHandler(async (args) => {
            const formData = new FormData();
            formData.append('url', args['fileUrl']);
            return client.updateImageFromFile(args['boardId'], args['itemId'], formData);
        }),
        miro_delete_image: createHandler((args) => client.deleteImage(args['boardId'], args['itemId'])),
        miro_list_images: createHandler((args) => client.listImagesByBoard(args['boardId'])),
    };
    return { name: 'miro_images', tools, handlers };
}
