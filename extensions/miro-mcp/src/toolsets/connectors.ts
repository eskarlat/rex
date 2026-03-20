import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createConnectorsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
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
    miro_list_connectors: createHandler((args) =>
      client.listConnectors(args['boardId'] as string),
    ),
    miro_create_connector: createHandler((args) =>
      client.createConnector(
        args['boardId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_get_connector: createHandler((args) =>
      client.getConnector(args['boardId'] as string, args['connectorId'] as string),
    ),
    miro_update_connector: createHandler((args) =>
      client.updateConnector(
        args['boardId'] as string,
        args['connectorId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_delete_connector: createHandler((args) =>
      client.deleteConnector(args['boardId'] as string, args['connectorId'] as string),
    ),
  };

  return { name: 'miro_connectors', tools, handlers };
}
