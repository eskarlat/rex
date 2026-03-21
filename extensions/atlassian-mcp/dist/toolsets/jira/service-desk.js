import { markdownResult, errorResult } from '../types.js';
export function createServiceDeskToolset(client) {
    return {
        name: 'jira_service_desk',
        tools: [
            {
                name: 'jira_get_service_desk_for_project',
                description: 'Get all Jira Service Management service desks.',
                inputSchema: { type: 'object', properties: {} },
            },
            {
                name: 'jira_get_service_desk_queues',
                description: 'Get queues for a Jira Service Management service desk.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serviceDeskId: { type: 'number', description: 'Service desk ID' },
                    },
                    required: ['serviceDeskId'],
                },
            },
            {
                name: 'jira_get_queue_issues',
                description: 'Get issues in a service desk queue.',
                inputSchema: {
                    type: 'object',
                    properties: {
                        serviceDeskId: { type: 'number', description: 'Service desk ID' },
                        queueId: { type: 'number', description: 'Queue ID' },
                    },
                    required: ['serviceDeskId', 'queueId'],
                },
            },
        ],
        handlers: {
            jira_get_service_desk_for_project: async () => {
                try {
                    const data = await client.getServiceDesks();
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_service_desk_queues: async (args) => {
                try {
                    const data = await client.getServiceDeskQueues(args['serviceDeskId']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
            jira_get_queue_issues: async (args) => {
                try {
                    const data = await client.getQueueIssues(args['serviceDeskId'], args['queueId']);
                    return markdownResult(data);
                }
                catch (err) {
                    return errorResult(err instanceof Error ? err.message : String(err));
                }
            },
        },
    };
}
