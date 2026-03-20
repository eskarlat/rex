import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createImagesToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
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
    miro_create_image_from_url: createHandler((args) =>
      client.createImageFromUrl(
        args['boardId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_create_image_from_file: createHandler(async (args) => {
      const formData = new FormData();
      formData.append('url', args['fileUrl'] as string);
      return client.createImageFromFile(args['boardId'] as string, formData);
    }),
    miro_get_image: createHandler((args) =>
      client.getImage(args['boardId'] as string, args['itemId'] as string),
    ),
    miro_update_image: createHandler((args) =>
      client.updateImage(
        args['boardId'] as string,
        args['itemId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_update_image_from_file: createHandler(async (args) => {
      const formData = new FormData();
      formData.append('url', args['fileUrl'] as string);
      return client.updateImageFromFile(
        args['boardId'] as string,
        args['itemId'] as string,
        formData,
      );
    }),
    miro_delete_image: createHandler((args) =>
      client.deleteImage(args['boardId'] as string, args['itemId'] as string),
    ),
    miro_list_images: createHandler((args) =>
      client.listImagesByBoard(args['boardId'] as string),
    ),
  };

  return { name: 'miro_images', tools, handlers };
}
