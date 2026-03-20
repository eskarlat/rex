import { createHandler } from './types.js';
export function createExportsToolset(client) {
    const tools = [
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
        miro_create_export_job: createHandler((args) => client.createExportJob(args['boardId'], args['data'])),
        miro_get_export_job_status: createHandler((args) => client.getExportJobStatus(args['boardId'], args['jobId'])),
        miro_get_export_job_results: createHandler((args) => client.getExportJobResults(args['boardId'], args['jobId'])),
    };
    return { name: 'miro_exports', tools, handlers };
}
