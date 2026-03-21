import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createOrganizationToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_get_organization',
      description: 'Get organization information.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
        },
        required: ['orgId'],
      },
    },
    {
      name: 'miro_list_org_members',
      description: 'List members of an organization.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          query: {
            type: 'object',
            description: 'Optional query parameters (e.g. limit, offset)',
          },
        },
        required: ['orgId'],
      },
    },
    {
      name: 'miro_get_org_member',
      description: 'Get an organization member by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          memberId: { type: 'string', description: 'Member ID' },
        },
        required: ['orgId', 'memberId'],
      },
    },
    {
      name: 'miro_get_audit_logs',
      description: 'Get audit logs for an organization.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          query: {
            type: 'object',
            description: 'Optional query parameters (e.g. limit, offset, from, to)',
          },
        },
        required: ['orgId'],
      },
    },
  ];

  const handlers = {
    miro_get_organization: createHandler((args) => client.getOrganization(args['orgId'] as string)),
    miro_list_org_members: createHandler((args) =>
      client.listOrgMembers(
        args['orgId'] as string,
        args['query'] as Record<string, unknown> | undefined,
      ),
    ),
    miro_get_org_member: createHandler((args) =>
      client.getOrgMember(args['orgId'] as string, args['memberId'] as string),
    ),
    miro_get_audit_logs: createHandler((args) =>
      client.getAuditLogs(
        args['orgId'] as string,
        args['query'] as Record<string, unknown> | undefined,
      ),
    ),
  };

  return { name: 'miro_organization', tools, handlers };
}
