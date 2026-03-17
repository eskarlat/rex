import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), error: vi.fn() },
}));

import * as clack from '@clack/prompts';
import { handleSchedulerList } from './scheduler-list.command.js';

describe('scheduler-list command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows message when no tasks exist', () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockReturnValue([]),
      }),
    };

    handleSchedulerList({ projectPath: null, db: mockDb as never });

    expect(clack.log.info).toHaveBeenCalledWith('No scheduled tasks.');
  });

  it('lists tasks for a specific project', () => {
    const mockAll = vi.fn().mockReturnValue([
      {
        id: 'figma:sync',
        extension_name: 'figma',
        project_path: '/my/project',
        cron: '*/5 * * * *',
        command: 'renre-kit figma:content',
        enabled: 1,
        last_run_at: '2026-03-17T10:00:00Z',
        last_status: 'success',
        next_run_at: '2026-03-17T10:05:00Z',
      },
    ]);
    const mockDb = {
      prepare: vi.fn().mockReturnValue({ all: mockAll }),
    };

    handleSchedulerList({ projectPath: '/my/project', db: mockDb as never });

    expect(mockAll).toHaveBeenCalledWith('/my/project');
    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('figma:sync'));
    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('enabled'));
  });

  it('shows paused status for disabled tasks', () => {
    const mockDb = {
      prepare: vi.fn().mockReturnValue({
        all: vi.fn().mockReturnValue([
          {
            id: 'task-1',
            extension_name: 'ext',
            project_path: null,
            cron: '0 * * * *',
            command: 'echo hello',
            enabled: 0,
            last_run_at: null,
            last_status: null,
            next_run_at: '2026-03-17T11:00:00Z',
          },
        ]),
      }),
    };

    handleSchedulerList({ projectPath: null, db: mockDb as never });

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('paused'));
  });
});
