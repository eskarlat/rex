import type { JiraClient } from '../../client/jira-client.js';
import type { Toolset } from '../types.js';
import { safeExec, paginationArgs, boardIdSchema, paginationSchema } from '../types.js';

export function createAgileToolset(client: JiraClient): Toolset {
  return {
    name: 'jira_agile',
    tools: [
      {
        name: 'jira_get_agile_boards',
        description: 'List all agile boards (Scrum/Kanban).',
        inputSchema: { type: 'object', properties: { ...paginationSchema } },
      },
      {
        name: 'jira_get_board_issues',
        description: 'Get all issues on an agile board.',
        inputSchema: {
          type: 'object',
          properties: { ...boardIdSchema, ...paginationSchema },
          required: ['boardId'],
        },
      },
      {
        name: 'jira_get_sprints_from_board',
        description: 'Get all sprints for an agile board.',
        inputSchema: {
          type: 'object',
          properties: { ...boardIdSchema, ...paginationSchema },
          required: ['boardId'],
        },
      },
      {
        name: 'jira_get_sprint_issues',
        description: 'Get all issues in a sprint.',
        inputSchema: {
          type: 'object',
          properties: { sprintId: { type: 'number', description: 'Sprint ID' }, ...paginationSchema },
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
      jira_get_agile_boards: (args) =>
        safeExec(() => client.getBoards(...paginationArgs(args))),
      jira_get_board_issues: (args) =>
        safeExec(() =>
          client.getBoardIssues(args['boardId'] as number, ...paginationArgs(args)),
        ),
      jira_get_sprints_from_board: (args) =>
        safeExec(() =>
          client.getSprintsFromBoard(args['boardId'] as number, ...paginationArgs(args)),
        ),
      jira_get_sprint_issues: (args) =>
        safeExec(() =>
          client.getSprintIssues(args['sprintId'] as number, ...paginationArgs(args)),
        ),
      jira_create_sprint: (args) =>
        safeExec(() => {
          const sprint: Record<string, unknown> = {
            originBoardId: args['boardId'] as number,
            name: args['name'] as string,
          };
          if (args['startDate']) sprint['startDate'] = args['startDate'];
          if (args['endDate']) sprint['endDate'] = args['endDate'];
          if (args['goal']) sprint['goal'] = args['goal'];
          return client.createSprint(sprint);
        }),
      jira_update_sprint: (args) =>
        safeExec(() => {
          const sprintId = args['sprintId'] as number;
          const update: Record<string, unknown> = {};
          if (args['name']) update['name'] = args['name'];
          if (args['state']) update['state'] = args['state'];
          if (args['startDate']) update['startDate'] = args['startDate'];
          if (args['endDate']) update['endDate'] = args['endDate'];
          if (args['goal']) update['goal'] = args['goal'];
          return client.updateSprint(sprintId, update);
        }),
      jira_add_issues_to_sprint: (args) =>
        safeExec(() =>
          client.addIssuesToSprint(args['sprintId'] as number, args['issueKeys'] as string[]),
        ),
    },
  };
}
