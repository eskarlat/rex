import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createConfluenceUsersToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_users',
    tools: [
      {
        name: 'confluence_search_user',
        description: 'Search for a Confluence user by name.',
        inputSchema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'User name or partial name to search' },
          },
          required: ['query'],
        },
      },
    ],
    handlers: {
      confluence_search_user: async (args) => {
        try {
          const data = await client.searchUser(args['query'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
