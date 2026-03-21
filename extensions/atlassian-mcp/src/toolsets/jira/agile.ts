import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { markdownResult, errorResult } from '../types.js';

export function createAgileToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_agile',
    tools: [
      {
        name: 'jira_get_agile_boards',
        description: 'List all agile boards (Scrum/Kanban).',
        inputSchema: {
          type: 'object',
          properties: {
            startAt: { type: 'number', description: 'Pagination start' },
            maxResults: { type: 'number', description: 'Max results' },
          },
        },
      },
      {
        name: 'jira_get_board_issues',
        description: 'Get all issues on an agile board.',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: { type: 'number', description: 'Board ID' },
            startAt: { type: 'number', description: 'Pagination start' },
            maxResults: { type: 'number', description: 'Max results' },
          },
          required: ['boardId'],
        },
      },
      {
        name: 'jira_get_sprints_from_board',
        description: 'Get all sprints for an agile board.',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: { type: 'number', description: 'Board ID' },
            startAt: { type: 'number', description: 'Pagination start' },
            maxResults: { type: 'number', description: 'Max results' },
          },
          required: ['boardId'],
        },
      },
      {
        name: 'jira_get_sprint_issues',
        description: 'Get all issues in a sprint.',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: { type: 'number', description: 'Sprint ID' },
            startAt: { type: 'number', description: 'Pagination start' },
            maxResults: { type: 'number', description: 'Max results' },
          },
          required: ['sprintId'],
        },
      },
      {
        name: 'jira_create_sprint',
        description: 'Create a new sprint on a board.',
        inputSchema: {
          type: 'object',
          properties: {
            boardId: { type: 'number', description: 'Board ID' },
            name: { type: 'string', description: 'Sprint name' },
            startDate: { type: 'string', description: 'Start date (ISO 8601)' },
            endDate: { type: 'string', description: 'End date (ISO 8601)' },
            goal: { type: 'string', description: 'Sprint goal' },
          },
          required: ['boardId', 'name'],
        },
      },
      {
        name: 'jira_update_sprint',
        description: 'Update an existing sprint.',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: { type: 'number', description: 'Sprint ID' },
            name: { type: 'string', description: 'Sprint name' },
            state: { type: 'string', description: 'Sprint state (active, closed)' },
            startDate: { type: 'string', description: 'Start date' },
            endDate: { type: 'string', description: 'End date' },
            goal: { type: 'string', description: 'Sprint goal' },
          },
          required: ['sprintId'],
        },
      },
      {
        name: 'jira_add_issues_to_sprint',
        description: 'Move issues into a sprint.',
        inputSchema: {
          type: 'object',
          properties: {
            sprintId: { type: 'number', description: 'Sprint ID' },
            issueKeys: {
              type: 'array',
              items: { type: 'string' },
              description: 'Issue keys to add',
            },
          },
          required: ['sprintId', 'issueKeys'],
        },
      },
    ],
    handlers: {
      jira_get_agile_boards: async (args) => {
        try {
          const data = await client.getBoards(
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_board_issues: async (args) => {
        try {
          const data = await client.getBoardIssues(
            args['boardId'] as number,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_sprints_from_board: async (args) => {
        try {
          const data = await client.getSprintsFromBoard(
            args['boardId'] as number,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_get_sprint_issues: async (args) => {
        try {
          const data = await client.getSprintIssues(
            args['sprintId'] as number,
            (args['startAt'] as number | undefined) ?? 0,
            (args['maxResults'] as number | undefined) ?? 50,
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_create_sprint: async (args) => {
        try {
          const sprint: Record<string, unknown> = {
            originBoardId: args['boardId'] as number,
            name: args['name'] as string,
          };
          if (args['startDate']) sprint['startDate'] = args['startDate'];
          if (args['endDate']) sprint['endDate'] = args['endDate'];
          if (args['goal']) sprint['goal'] = args['goal'];
          const data = await client.createSprint(sprint);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_update_sprint: async (args) => {
        try {
          const sprintId = args['sprintId'] as number;
          const update: Record<string, unknown> = {};
          if (args['name']) update['name'] = args['name'];
          if (args['state']) update['state'] = args['state'];
          if (args['startDate']) update['startDate'] = args['startDate'];
          if (args['endDate']) update['endDate'] = args['endDate'];
          if (args['goal']) update['goal'] = args['goal'];
          const data = await client.updateSprint(sprintId, update);
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
      jira_add_issues_to_sprint: async (args) => {
        try {
          const data = await client.addIssuesToSprint(
            args['sprintId'] as number,
            args['issueKeys'] as string[],
          );
          return markdownResult(data);
        } catch (err) {
          return errorResult(err instanceof Error ? err.message : String(err));
        }
      },
    },
  };
}
