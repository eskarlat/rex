import { createHandler } from './types.js';
export function createBoardsToolset(client) {
    const tools = [
        {
            name: 'miro_list_boards',
            description: 'List all boards. Supports optional query parameters like limit and sort.',
            inputSchema: {
                type: 'object',
                properties: {
                    query: {
                        type: 'object',
                        description: 'Optional query parameters (e.g. limit, sort, offset)',
                    },
                },
            },
        },
        {
            name: 'miro_create_board',
            description: 'Create a new board.',
            inputSchema: {
                type: 'object',
                properties: {
                    data: {
                        type: 'object',
                        description: 'Board data (name, description, etc.)',
                    },
                },
                required: ['data'],
            },
        },
        {
            name: 'miro_get_board',
            description: 'Get a board by ID.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                },
                required: ['boardId'],
            },
        },
        {
            name: 'miro_update_board',
            description: 'Update a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                    data: { type: 'object', description: 'Updated board data' },
                },
                required: ['boardId', 'data'],
            },
        },
        {
            name: 'miro_delete_board',
            description: 'Delete a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID' },
                },
                required: ['boardId'],
            },
        },
        {
            name: 'miro_copy_board',
            description: 'Copy a board.',
            inputSchema: {
                type: 'object',
                properties: {
                    boardId: { type: 'string', description: 'Board ID to copy' },
                    data: { type: 'object', description: 'Optional copy parameters' },
                },
                required: ['boardId'],
            },
        },
    ];
    const handlers = {
        miro_list_boards: createHandler((args) => client.listBoards(args['query'])),
        miro_create_board: createHandler((args) => client.createBoard(args['data'])),
        miro_get_board: createHandler((args) => client.getBoard(args['boardId'])),
        miro_update_board: createHandler((args) => client.updateBoard(args['boardId'], args['data'])),
        miro_delete_board: createHandler((args) => client.deleteBoard(args['boardId'])),
        miro_copy_board: createHandler((args) => client.copyBoard(args['boardId'], args['data'])),
    };
    return { name: 'miro_boards', tools, handlers };
}
