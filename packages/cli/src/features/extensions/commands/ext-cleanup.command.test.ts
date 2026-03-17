import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn() },
}));

vi.mock('node:fs', () => ({
  default: {
    existsSync: vi.fn(() => true),
    readdirSync: vi.fn(),
  },
}));

vi.mock('../manager/extension-manager.js', () => ({
  getActivated: vi.fn(),
}));

vi.mock('../../../shared/fs-helpers.js', () => ({
  removeDirSync: vi.fn(),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  EXTENSIONS_DIR: '/tmp/extensions',
}));

import * as clack from '@clack/prompts';
import fs from 'node:fs';
import { handleExtCleanup } from './ext-cleanup.command.js';
import { getActivated } from '../manager/extension-manager.js';
import { removeDirSync } from '../../../shared/fs-helpers.js';

function mockDb(projects: Array<{ path: string }>): never {
  return {
    prepare: () => ({
      all: () => projects.map((p, i) => ({
        id: i + 1,
        name: `project-${i}`,
        path: p.path,
        created_at: '2026-01-01',
        last_accessed_at: '2026-01-01',
      })),
    }),
  } as never;
}

describe('ext-cleanup command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove versions not referenced by any project', () => {
    const db = mockDb([
      { path: '/tmp/project-a' },
      { path: '/tmp/project-b' },
    ]);

    vi.mocked(getActivated)
      .mockReturnValueOnce({ jira: '1.1.0' })
      .mockReturnValueOnce({ jira: '1.0.0', github: '2.0.0' });

    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValueOnce(
      ['jira@1.0.0', 'jira@1.1.0', 'jira@0.9.0', 'github@2.0.0'] as unknown as ReturnType<typeof fs.readdirSync>,
    );

    handleExtCleanup({ db });

    expect(removeDirSync).toHaveBeenCalledWith('/tmp/extensions/jira@0.9.0');
    expect(removeDirSync).toHaveBeenCalledTimes(1);
    expect(removeDirSync).not.toHaveBeenCalledWith('/tmp/extensions/jira@1.0.0');
    expect(removeDirSync).not.toHaveBeenCalledWith('/tmp/extensions/jira@1.1.0');
    expect(removeDirSync).not.toHaveBeenCalledWith('/tmp/extensions/github@2.0.0');
  });

  it('should show message when nothing to clean', () => {
    const db = mockDb([{ path: '/tmp/project-a' }]);
    vi.mocked(getActivated).mockReturnValue({ jira: '1.0.0' });
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValueOnce(
      ['jira@1.0.0'] as unknown as ReturnType<typeof fs.readdirSync>,
    );

    handleExtCleanup({ db });

    expect(removeDirSync).not.toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalledWith('No unused extension versions to clean up.');
  });

  it('should handle empty extensions directory', () => {
    const db = mockDb([]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    handleExtCleanup({ db });

    expect(clack.log.info).toHaveBeenCalledWith('No unused extension versions to clean up.');
  });

  it('should handle no projects in database', () => {
    const db = mockDb([]);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValueOnce(
      ['jira@1.0.0'] as unknown as ReturnType<typeof fs.readdirSync>,
    );

    handleExtCleanup({ db });

    expect(removeDirSync).toHaveBeenCalledWith('/tmp/extensions/jira@1.0.0');
    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('1'));
  });
});
