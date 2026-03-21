import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createProjectsToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_projects',
    tools: [
      {
        name: 'jira_get_all_projects',
        description: 'List all Jira projects accessible to the current user.',
        inputSchema: { type: 'object', properties: {} },
      },
      {
        name: 'jira_get_project_versions',
        description: 'Get all versions (releases) for a Jira project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'jira_get_project_components',
        description: 'Get all components for a Jira project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
          },
          required: ['projectKey'],
        },
      },
      {
        name: 'jira_create_version',
        description: 'Create a new version (release) in a Jira project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
            name: { type: 'string', description: 'Version name' },
            description: { type: 'string', description: 'Version description' },
            releaseDate: { type: 'string', description: 'Release date (YYYY-MM-DD)' },
          },
          required: ['projectKey', 'name'],
        },
      },
      {
        name: 'jira_batch_create_versions',
        description: 'Create multiple versions in a Jira project.',
        inputSchema: {
          type: 'object',
          properties: {
            projectKey: { type: 'string', description: 'Project key' },
            versions: {
              type: 'array',
              items: { type: 'object' },
              description: 'Array of version objects with name, description, releaseDate',
            },
          },
          required: ['projectKey', 'versions'],
        },
      },
    ],
    handlers: {
      jira_get_all_projects: async () => {
        try {
          const data = await client.getAllProjects();
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_project_versions: async (args) => {
        try {
          const data = await client.getProjectVersions(args['projectKey'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_project_components: async (args) => {
        try {
          const data = await client.getProjectComponents(args['projectKey'] as string);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_create_version: async (args) => {
        try {
          const version: Record<string, unknown> = {
            project: args['projectKey'] as string,
            name: args['name'] as string,
          };
          if (args['description']) version['description'] = args['description'];
          if (args['releaseDate']) version['releaseDate'] = args['releaseDate'];
          const data = await client.createVersion(version);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_batch_create_versions: async (args) => {
        try {
          const projectKey = args['projectKey'] as string;
          const versions = args['versions'] as Array<Record<string, unknown>>;
          const results = [];
          for (const v of versions) {
            const data = await client.createVersion({ project: projectKey, ...v });
            results.push(data);
          }
          return markdownResult(results);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
