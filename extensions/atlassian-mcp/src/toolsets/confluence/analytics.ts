import type { ConfluenceClient } from '../../client/confluence-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createAnalyticsToolset(client: ConfluenceClient): Toolset {
  return {
    name: 'confluence_analytics',
    tools: [
      {
        name: 'confluence_get_page_views',
        description: 'Get view statistics for a Confluence page.',
        inputSchema: {
          type: 'object',
          properties: {
            pageId: { type: 'string', description: 'Page ID' },
          },
          required: ['pageId'],
        },
      },
    ],
    handlers: {
      confluence_get_page_views: async (args) => {
        try {
          const data = await client.getPageViews(args['pageId'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
