import type { MiroClient } from '../client/miro-client.js';
import type { Toolset, ToolDefinition } from './types.js';
import { createHandler } from './types.js';

export function createComplianceToolset(client: MiroClient): Toolset {
  const tools: ToolDefinition[] = [
    {
      name: 'miro_list_compliance_cases',
      description: 'List compliance cases for an organization.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
        },
        required: ['orgId'],
      },
    },
    {
      name: 'miro_get_compliance_case',
      description: 'Get a compliance case by ID.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          caseId: { type: 'string', description: 'Compliance case ID' },
        },
        required: ['orgId', 'caseId'],
      },
    },
    {
      name: 'miro_create_compliance_case',
      description: 'Create a new compliance case.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          data: { type: 'object', description: 'Compliance case data' },
        },
        required: ['orgId', 'data'],
      },
    },
    {
      name: 'miro_update_compliance_case',
      description: 'Update a compliance case.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          caseId: { type: 'string', description: 'Compliance case ID' },
          data: { type: 'object', description: 'Updated compliance case data' },
        },
        required: ['orgId', 'caseId', 'data'],
      },
    },
    {
      name: 'miro_list_legal_holds',
      description: 'List legal holds for an organization.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
        },
        required: ['orgId'],
      },
    },
    {
      name: 'miro_create_legal_hold',
      description: 'Create a new legal hold.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          data: { type: 'object', description: 'Legal hold data' },
        },
        required: ['orgId', 'data'],
      },
    },
    {
      name: 'miro_get_content_logs',
      description: 'Get content logs for an organization.',
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
      name: 'miro_get_content_classification',
      description: 'Get content classification for a board.',
      inputSchema: {
        type: 'object',
        properties: {
          orgId: { type: 'string', description: 'Organization ID' },
          boardId: { type: 'string', description: 'Board ID' },
        },
        required: ['orgId', 'boardId'],
      },
    },
  ];

  const handlers = {
    miro_list_compliance_cases: createHandler((args) =>
      client.listComplianceCases(args['orgId'] as string),
    ),
    miro_get_compliance_case: createHandler((args) =>
      client.getComplianceCase(args['orgId'] as string, args['caseId'] as string),
    ),
    miro_create_compliance_case: createHandler((args) =>
      client.createComplianceCase(args['orgId'] as string, args['data'] as Record<string, unknown>),
    ),
    miro_update_compliance_case: createHandler((args) =>
      client.updateComplianceCase(
        args['orgId'] as string,
        args['caseId'] as string,
        args['data'] as Record<string, unknown>,
      ),
    ),
    miro_list_legal_holds: createHandler((args) => client.listLegalHolds(args['orgId'] as string)),
    miro_create_legal_hold: createHandler((args) =>
      client.createLegalHold(args['orgId'] as string, args['data'] as Record<string, unknown>),
    ),
    miro_get_content_logs: createHandler((args) =>
      client.getContentLogs(
        args['orgId'] as string,
        args['query'] as Record<string, unknown> | undefined,
      ),
    ),
    miro_get_content_classification: createHandler((args) =>
      client.getContentClassification(args['orgId'] as string, args['boardId'] as string),
    ),
  };

  return { name: 'miro_compliance', tools, handlers };
}
