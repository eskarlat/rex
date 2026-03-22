vi.mock('../../shared/client.js', () => ({
  createClients: vi.fn(),
}));

vi.mock('../../shared/formatters.js', () => ({
  toOutput: vi.fn((data: unknown) => ({ output: JSON.stringify(data), exitCode: 0 })),
  errorOutput: vi.fn((err: unknown) => ({ output: String(err), exitCode: 1 })),
}));

import { createClients } from '../../shared/client.js';
import { toOutput, errorOutput } from '../../shared/formatters.js';
import type { ExecutionContext } from '../../shared/types.js';
import getAgileBoards from './get-agile-boards.js';
import getBoardIssues from './get-board-issues.js';
import getSprintsFromBoard from './get-sprints-from-board.js';
import getSprintIssues from './get-sprint-issues.js';
import createSprint from './create-sprint.js';
import updateSprint from './update-sprint.js';
import addIssuesToSprint from './add-issues-to-sprint.js';

const mockJira = {
  getBoards: vi.fn(),
  getBoardIssues: vi.fn(),
  getSprintsFromBoard: vi.fn(),
  getSprintIssues: vi.fn(),
  createSprint: vi.fn(),
  updateSprint: vi.fn(),
  addIssuesToSprint: vi.fn(),
};

function makeContext(args: Record<string, unknown> = {}): ExecutionContext {
  return {
    projectName: 'test',
    projectPath: '/tmp/test',
    args,
    config: { domain: 'test.atlassian.net', email: 'test@test.com', apiToken: 'token' },
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(createClients).mockReturnValue({ jira: mockJira as never, confluence: {} as never });
});

describe('get-agile-boards', () => {
  it('calls jira.getBoards with startAt and maxResults', async () => {
    mockJira.getBoards.mockResolvedValue({ values: [] });
    const ctx = makeContext({ startAt: 10, maxResults: 25 });
    await getAgileBoards(ctx);
    expect(mockJira.getBoards).toHaveBeenCalledWith(10, 25);
    expect(toOutput).toHaveBeenCalledWith({ values: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.getBoards.mockResolvedValue({ values: [] });
    const ctx = makeContext();
    await getAgileBoards(ctx);
    expect(mockJira.getBoards).toHaveBeenCalledWith(0, 50);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getBoards.mockRejectedValue(new Error('fail'));
    const ctx = makeContext();
    const result = await getAgileBoards(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-board-issues', () => {
  it('calls jira.getBoardIssues with boardId, startAt, maxResults', async () => {
    mockJira.getBoardIssues.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ boardId: 5, startAt: 10, maxResults: 20 });
    await getBoardIssues(ctx);
    expect(mockJira.getBoardIssues).toHaveBeenCalledWith(5, 10, 20);
    expect(toOutput).toHaveBeenCalledWith({ issues: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.getBoardIssues.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ boardId: 5 });
    await getBoardIssues(ctx);
    expect(mockJira.getBoardIssues).toHaveBeenCalledWith(5, 0, 50);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getBoardIssues.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ boardId: 5 });
    const result = await getBoardIssues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-sprints-from-board', () => {
  it('calls jira.getSprintsFromBoard with boardId, startAt, maxResults', async () => {
    mockJira.getSprintsFromBoard.mockResolvedValue({ values: [] });
    const ctx = makeContext({ boardId: 3, startAt: 5, maxResults: 10 });
    await getSprintsFromBoard(ctx);
    expect(mockJira.getSprintsFromBoard).toHaveBeenCalledWith(3, 5, 10);
    expect(toOutput).toHaveBeenCalledWith({ values: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.getSprintsFromBoard.mockResolvedValue({ values: [] });
    const ctx = makeContext({ boardId: 3 });
    await getSprintsFromBoard(ctx);
    expect(mockJira.getSprintsFromBoard).toHaveBeenCalledWith(3, 0, 50);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getSprintsFromBoard.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ boardId: 3 });
    const result = await getSprintsFromBoard(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('get-sprint-issues', () => {
  it('calls jira.getSprintIssues with sprintId, startAt, maxResults', async () => {
    mockJira.getSprintIssues.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ sprintId: 7, startAt: 0, maxResults: 30 });
    await getSprintIssues(ctx);
    expect(mockJira.getSprintIssues).toHaveBeenCalledWith(7, 0, 30);
    expect(toOutput).toHaveBeenCalledWith({ issues: [] });
  });

  it('uses defaults for startAt and maxResults', async () => {
    mockJira.getSprintIssues.mockResolvedValue({ issues: [] });
    const ctx = makeContext({ sprintId: 7 });
    await getSprintIssues(ctx);
    expect(mockJira.getSprintIssues).toHaveBeenCalledWith(7, 0, 50);
  });

  it('returns errorOutput on error', async () => {
    mockJira.getSprintIssues.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ sprintId: 7 });
    const result = await getSprintIssues(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('create-sprint', () => {
  it('calls jira.createSprint with all fields', async () => {
    mockJira.createSprint.mockResolvedValue({ id: 100 });
    const ctx = makeContext({
      boardId: 1,
      name: 'Sprint 1',
      startDate: '2026-01-01',
      endDate: '2026-01-14',
      goal: 'Ship feature',
    });
    await createSprint(ctx);
    expect(mockJira.createSprint).toHaveBeenCalledWith({
      originBoardId: 1,
      name: 'Sprint 1',
      startDate: '2026-01-01',
      endDate: '2026-01-14',
      goal: 'Ship feature',
    });
    expect(toOutput).toHaveBeenCalledWith({ id: 100 });
  });

  it('creates sprint with only required fields', async () => {
    mockJira.createSprint.mockResolvedValue({ id: 101 });
    const ctx = makeContext({ boardId: 1, name: 'Sprint 2' });
    await createSprint(ctx);
    expect(mockJira.createSprint).toHaveBeenCalledWith({
      originBoardId: 1,
      name: 'Sprint 2',
    });
  });

  it('returns errorOutput on error', async () => {
    mockJira.createSprint.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ boardId: 1, name: 'Sprint' });
    const result = await createSprint(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('update-sprint', () => {
  it('calls jira.updateSprint with sprintId and update fields', async () => {
    mockJira.updateSprint.mockResolvedValue({ id: 10 });
    const ctx = makeContext({
      sprintId: 10,
      name: 'Updated Sprint',
      state: 'active',
      startDate: '2026-02-01',
      endDate: '2026-02-14',
      goal: 'New goal',
    });
    await updateSprint(ctx);
    expect(mockJira.updateSprint).toHaveBeenCalledWith(10, {
      name: 'Updated Sprint',
      state: 'active',
      startDate: '2026-02-01',
      endDate: '2026-02-14',
      goal: 'New goal',
    });
    expect(toOutput).toHaveBeenCalledWith({ id: 10 });
  });

  it('sends only provided fields', async () => {
    mockJira.updateSprint.mockResolvedValue({ id: 10 });
    const ctx = makeContext({ sprintId: 10, name: 'Renamed' });
    await updateSprint(ctx);
    expect(mockJira.updateSprint).toHaveBeenCalledWith(10, { name: 'Renamed' });
  });

  it('returns errorOutput on error', async () => {
    mockJira.updateSprint.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ sprintId: 10 });
    const result = await updateSprint(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});

describe('add-issues-to-sprint', () => {
  it('calls jira.addIssuesToSprint with sprintId and issueKeys', async () => {
    mockJira.addIssuesToSprint.mockResolvedValue(undefined);
    const ctx = makeContext({ sprintId: 10, issueKeys: ['TEST-1', 'TEST-2'] });
    await addIssuesToSprint(ctx);
    expect(mockJira.addIssuesToSprint).toHaveBeenCalledWith(10, ['TEST-1', 'TEST-2']);
    expect(toOutput).toHaveBeenCalledWith({ success: true, sprintId: 10, issueKeys: ['TEST-1', 'TEST-2'] });
  });

  it('returns errorOutput on error', async () => {
    mockJira.addIssuesToSprint.mockRejectedValue(new Error('fail'));
    const ctx = makeContext({ sprintId: 10, issueKeys: ['TEST-1'] });
    const result = await addIssuesToSprint(ctx);
    expect(errorOutput).toHaveBeenCalledWith(expect.any(Error));
    expect(result.exitCode).toBe(1);
  });
});
