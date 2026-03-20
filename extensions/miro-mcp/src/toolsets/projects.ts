import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createProjectsToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
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
    miro_list_project_members: createHandler((args) =>
      client.listProjectMembers(args['orgId'] as string, args['projectId'] as string),
    ),
    miro_get_project_member: createHandler((args) =>
      client.getProjectMember(
        args['orgId'] as string,
        args['projectId'] as string,
        args['memberId'] as string,
      ),
    ),
    miro_update_project_member: createHandler((args) =>
      client.updateProjectMember(
        args['orgId'] as string,
        args['projectId'] as string,
        args['memberId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
  };

  return { name: 'miro_projects', tools, handlers };
}
