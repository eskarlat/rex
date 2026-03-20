import { createHandler } from './types.js';
export function createConnectorsToolset(client) {
    const tools = [
        {
            name: 'miro_list_connectors',
            description: 'List connectors on a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                },
                required: ['boardId'],
            },
        },
        {
            name: 'miro_create_connector',
            description: 'Create a connector on a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    data: {
                        type: 'object',
                        description: 'Connector data (startItem, endItem, style, etc.)',
                    },
                },
                required: ['boardId', 'data'],
            },
        },
        {
            name: 'miro_get_connector',
            description: 'Get a connector by ID.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    connectorId: { type: 'string', description: 'Connector ID' },
                },
                required: ['boardId', 'connectorId'],
            },
        },
        {
            name: 'miro_update_connector',
            description: 'Update a connector.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    connectorId: { type: 'string', description: 'Connector ID' },
                    data: { type: 'object', description: 'Updated connector data' },
                },
                required: ['boardId', 'connectorId', 'data'],
            },
        },
        {
            name: 'miro_delete_connector',
            description: 'Delete a connector.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    connectorId: { type: 'string', description: 'Connector ID' },
                },
                required: ['boardId', 'connectorId'],
            },
        },
    ];
    const handlers = {
        miro_list_connectors: createHandler((args) => client.listConnectors(args['boardId'])),
        miro_create_connector: createHandler((args) => client.createConnector(args['boardId'], args['data'])),
        miro_get_connector: createHandler((args) => client.getConnector(args['boardId'], args['connectorId'])),
        miro_update_connector: createHandler((args) => client.updateConnector(args['boardId'], args['connectorId'], args['data'])),
        miro_delete_connector: createHandler((args) => client.deleteConnector(args['boardId'], args['connectorId'])),
    };
    return { name: 'miro_connectors', tools, handlers };
}
