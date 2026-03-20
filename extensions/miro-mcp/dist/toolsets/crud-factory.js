import { createHandler } from './types.js';
export function createCrudToolset(config, client) {
    const { toolsetName, resourceName, toolPrefix, resourceSlug, methodPrefix, dataDescription, } = config;
    const createName = `${toolPrefix}_create_${resourceSlug}`;
    const getName = `${toolPrefix}_get_${resourceSlug}`;
    const updateName = `${toolPrefix}_update_${resourceSlug}`;
    const deleteName = `${toolPrefix}_delete_${resourceSlug}`;
    const tools = [
        {
            name: createName,
            description: `Create a new ${resourceName} on a board.`,
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    data: {
                        type: 'object',
                        description: dataDescription ?? `${resourceName} data`,
                    },
                },
                required: ['boardId', 'data'],
            },
        },
        {
            name: getName,
            description: `Get a ${resourceName} by ID.`,
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: `${resourceName} ID` },
                },
                required: ['boardId', 'itemId'],
            },
        },
        {
            name: updateName,
            description: `Update a ${resourceName}.`,
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: `${resourceName} ID` },
                    data: {
                        type: 'object',
                        description: dataDescription ?? `Updated ${resourceName} data`,
                    },
                },
                required: ['boardId', 'itemId', 'data'],
            },
        },
        {
            name: deleteName,
            description: `Delete a ${resourceName}.`,
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    itemId: { type: 'string', description: `${resourceName} ID` },
                },
                required: ['boardId', 'itemId'],
            },
        },
    ];
    const createMethod = client[`create${methodPrefix}`];
    const getMethod = client[`get${methodPrefix}`];
    const updateMethod = client[`update${methodPrefix}`];
    const deleteMethod = client[`delete${methodPrefix}`];
    const handlers = {
        [createName]: createHandler((args) => createMethod.call(client, args['boardId'], args['data'])),
        [getName]: createHandler((args) => getMethod.call(client, args['boardId'], args['itemId'])),
        [updateName]: createHandler((args) => updateMethod.call(client, args['boardId'], args['itemId'], args['data'])),
        [deleteName]: createHandler((args) => deleteMethod.call(client, args['boardId'], args['itemId'])),
    };
    return { name: toolsetName, tools, handlers };
}
