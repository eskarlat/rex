import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { safeExec, confluencePaginationArgs } from '../types.js';

export function createPagesToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_pages',
    tools: [
      {
        name: 'confluence_search',
        description: 'Search Confluence content using CQL (Confluence Query Language).',
        inputSchema: {
          type: 'object',
          properties: {
            cql: { type: 'string', description: 'CQL query string' },
            limit: { type: 'number', description: 'Max results (default: 25)' },
            start: { type: 'number', description: 'Pagination start index' },
          },
          required: ['cql'],
        },
      },
      {
        name: 'confluence_get_page',
        description: 'Get a Confluence page by ID with its content.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            expand: {
              type: 'string',
              description: 'Fields to expand (default: body.storage,version)',
            },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_get_page_children',
        description: 'Get child pages of a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Parent page ID' },
            limit: { type: 'number', description: 'Max results' },
            start: { type: 'number', description: 'Pagination start' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_get_page_history',
        description: 'Get the version history of a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_create_page',
        description: 'Create a new Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            spaceKey: { type: 'string', description: 'Space key' },
            title: { type: 'string', description: 'Page title' },
            body: {
              type: 'string',
              description: 'Page content (Confluence storage format or HTML)',
            },
            parentId: { type: 'string', description: 'Parent page ID (optional)' },
          },
          required: ['spaceKey', 'title', 'body'],
        },
      },
      {
        name: 'confluence_update_page',
        description: 'Update an existing Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            title: { type: 'string', description: 'New page title' },
            body: { type: 'string', description: 'New page content' },
            version: {
              type: 'number',
              description: 'Current version number (required for conflict detection)',
            },
          },
          required: ['pageId', 'title', 'body', 'version'],
        },
      },
      {
        name: 'confluence_delete_page',
        description: 'Delete a Confluence page by ID.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
      {
        name: 'confluence_move_page',
        description: 'Move a Confluence page under a different parent.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID to move' },
            targetAncestorId: { type: 'string', description: 'New parent page ID' },
            currentVersion: { type: 'number', description: 'Current page version number' },
          },
          required: ['pageId', 'targetAncestorId', 'currentVersion'],
        },
      },
      {
        name: 'confluence_get_page_diff',
        description: 'Compare two versions of a Confluence page and return the differences.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
            fromVersion: { type: 'number', description: 'From version number' },
            toVersion: { type: 'number', description: 'To version number' },
          },
          required: ['pageId', 'fromVersion', 'toVersion'],
        },
      },
    ],
    handlers: {
      confluence_search: (args) =>
        safeExec(() => client.search(args['cql'] as string, ...confluencePaginationArgs(args))),
      confluence_get_page: (args) =>
        safeExec(() =>
          client.getPage(
            args['pageId'] as string,
            (args['expand'] as string | undefined) ?? 'body.storage,version',
          ),
        ),
      confluence_get_page_children: (args) =>
        safeExec(() =>
          client.getPageChildren(args['pageId'] as string, ...confluencePaginationArgs(args)),
        ),
      confluence_get_page_history: (args) =>
        safeExec(() => client.getPageHistory(args['pageId'] as string)),
      confluence_create_page: (args) =>
        safeExec(() => {
          const page: Record<string, unknown> = {
            type: 'page',
            title: args['title'] as string,
            space: { key: args['spaceKey'] as string },
            body: {
              storage: {
                value: args['body'] as string,
                representation: 'storage',
              },
            },
          };
          if (args['parentId']) {
            page['ancestors'] = [{ id: args['parentId'] as string }];
          }
          return client.createPage(page);
        }),
      confluence_update_page: (args) =>
        safeExec(() =>
          client.updatePage(args['pageId'] as string, {
            type: 'page',
            title: args['title'] as string,
            body: {
              storage: {
                value: args['body'] as string,
                representation: 'storage',
              },
            },
            version: { number: (args['version'] as number) + 1 },
          }),
        ),
      confluence_delete_page: (args) =>
        safeExec(async () => {
          await client.deletePage(args['pageId'] as string);
          return { success: true, pageId: args['pageId'] };
        }),
      confluence_move_page: (args) =>
        safeExec(() =>
          client.movePage(
            args['pageId'] as string,
            args['targetAncestorId'] as string,
            args['currentVersion'] as number,
          ),
        ),
      confluence_get_page_diff: (args) =>
        safeExec(async () => {
          const pageId = args['pageId'] as string;
          const fromVersion = args['fromVersion'] as number;
          const toVersion = args['toVersion'] as number;
          const [fromPage, toPage] = await Promise.all([
            client.getPageVersion(pageId, fromVersion) as Promise<Record<string, unknown>>,
            client.getPageVersion(pageId, toVersion) as Promise<Record<string, unknown>>,
          ]);
          const fromBody = (fromPage['body'] as Record<string, unknown>)?.['storage'] as
            | Record<string, unknown>
            | undefined;
          const toBody = (toPage['body'] as Record<string, unknown>)?.['storage'] as
            | Record<string, unknown>
            | undefined;
          return {
            pageId,
            fromVersion,
            toVersion,
            from: fromBody?.['value'] ?? '',
            to: toBody?.['value'] ?? '',
          };
        }),
    },
  };
}
