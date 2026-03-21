import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createExportsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_create_export_job',
      description: 'Start a board export job.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          data: {
            type: 'object',
            description: 'Export configuration (format, area, etc.)',
          },
        },
        required: ['boardId', 'data'],
      },
    },
    {
      name: 'miro_get_export_job_status',
      description: 'Check the status of an export job.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          jobId: { type: 'string', description: 'Export job ID' },
        },
        required: ['boardId', 'jobId'],
      },
    },
    {
      name: 'miro_get_export_job_results',
      description: 'Get the results of a completed export job.',
      inputSchema: {
        type: 'object',
        properties: {
          boardId: { type: 'string', description: 'Board ID' },
          jobId: { type: 'string', description: 'Export job ID' },
        },
        required: ['boardId', 'jobId'],
      },
    },
  ];

  const handlers = {
    miro_create_export_job: createHandler((args) =>
      client.createExportJob(args['boardId'] as string, args['data'] as Record<string, unknown>),
    ),
    miro_get_export_job_status: createHandler((args) =>
      client.getExportJobStatus(args['boardId'] as string, args['jobId'] as string),
    ),
    miro_get_export_job_results: createHandler((args) =>
      client.getExportJobResults(args['boardId'] as string, args['jobId'] as string),
    ),
  };

  return { name: 'miro_exports', tools, handlers };
}
