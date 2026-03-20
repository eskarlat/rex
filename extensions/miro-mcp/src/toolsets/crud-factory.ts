import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

interface CrudConfig {
  /** Toolset name, e.g. 'miro_sticky_notes' */
  toolsetName: string;
  /** Human-readable resource name, e.g. 'sticky note' */
  resourceName: string;
  /** Tool name prefix, e.g. 'miro' */
  toolPrefix: string;
  /** Resource slug for tool names, e.g. 'sticky_note' */
  resourceSlug: string;
  /** Client method prefix, e.g. 'StickyNote' → createStickyNote, getStickyNote, etc. */
  methodPrefix: string;
  /** API resource path segment, e.g. 'sticky_notes' */
  apiPath: string;
  /** Additional input properties for create/update */
  dataDescription?: string;
}

type ClientMethod = (
  boardId: string,
  ...rest: unknown[]
) => Promise<unknown>;

export function createCrudToolset(config: CrudConfig, client: MiroClient): Toolset {
  const {
    toolsetName,
    resourceName,
    toolPrefix,
    resourceSlug,
    methodPrefix,
    dataDescription,
  } = config;

  const createName = `${toolPrefix}_create_${resourceSlug}`;
  const getName = `${toolPrefix}_get_${resourceSlug}`;
  const updateName = `${toolPrefix}_update_${resourceSlug}`;
  const deleteName = `${toolPrefix}_delete_${resourceSlug}`;

  const tools: ToolDefinition[] = [
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

  const createMethod = client[`create${methodPrefix}` as keyof MiroClient] as ClientMethod;
  const getMethod = client[`get${methodPrefix}` as keyof MiroClient] as ClientMethod;
  const updateMethod = client[`update${methodPrefix}` as keyof MiroClient] as ClientMethod;
  const deleteMethod = client[`delete${methodPrefix}` as keyof MiroClient] as ClientMethod;

  const handlers = {
    [createName]: createHandler((args) =>
      createMethod.call(client, args['boardId'] as string, args['data'] as Record<string, unknown>),
    ),
    [getName]: createHandler((args) =>
      getMethod.call(client, args['boardId'] as string, args['itemId'] as string),
    ),
    [updateName]: createHandler((args) =>
      updateMethod.call(
        client,
        args['boardId'] as string,
        args['itemId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    [deleteName]: createHandler((args) =>
      deleteMethod.call(client, args['boardId'] as string, args['itemId'] as string),
    ),
  };

  return { name: toolsetName, tools, handlers };
}
