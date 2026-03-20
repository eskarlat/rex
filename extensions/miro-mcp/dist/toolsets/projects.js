import { createHandler } from './types.js';
export function createProjectsToolset(client) {
    const tools = [
        {
            name: 'miro_list_project_members',
            description: 'List members of a project.',
            inputSchema: {
                type: 'object',
                properties: {
                    orgId: { type: 'string', description: 'Organization ID' },
                    projectId: { type: 'string', description: 'Project ID' },
                },
                required: ['orgId', 'projectId'],
            },
        },
        {
            name: 'miro_get_project_member',
            description: 'Get a project member by ID.',
            inputSchema: {
                type: 'object',
                properties: {
                    orgId: { type: 'string', description: 'Organization ID' },
                    projectId: { type: 'string', description: 'Project ID' },
                    memberId: { type: 'string', description: 'Member ID' },
                },
                required: ['orgId', 'projectId', 'memberId'],
            },
        },
        {
            name: 'miro_update_project_member',
            description: 'Update a project member.',
            inputSchema: {
                type: 'object',
                properties: {
                    orgId: { type: 'string', description: 'Organization ID' },
                    projectId: { type: 'string', description: 'Project ID' },
                    memberId: { type: 'string', description: 'Member ID' },
                    data: { type: 'object', description: 'Updated member data' },
                },
                required: ['orgId', 'projectId', 'memberId', 'data'],
            },
        },
    ];
    const handlers = {
        miro_list_project_members: createHandler((args) => client.listProjectMembers(args['orgId'], args['projectId'])),
        miro_get_project_member: createHandler((args) => client.getProjectMember(args['orgId'], args['projectId'], args['memberId'])),
        miro_update_project_member: createHandler((args) => client.updateProjectMember(args['orgId'], args['projectId'], args['memberId'], args['data'])),
    };
    return { name: 'miro_projects', tools, handlers };
}
