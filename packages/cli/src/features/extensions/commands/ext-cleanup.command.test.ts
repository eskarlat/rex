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
  listInstalled: vi.fn(),
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
import { listInstalled } from '../manager/extension-manager.js';
import { removeDirSync } from '../../../shared/fs-helpers.js';

describe('ext-cleanup command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should remove unused extension versions', () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.1.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValueOnce(
      // Extension directories
      ['jira@1.0.0', 'jira@1.1.0', 'github@2.0.0'] as unknown as ReturnType<typeof fs.readdirSync>,
    );

    handleExtCleanup({ db: {} as never });

    expect(removeDirSync).toHaveBeenCalledWith('/tmp/extensions/jira@1.0.0');
    expect(removeDirSync).toHaveBeenCalledWith('/tmp/extensions/github@2.0.0');
    expect(removeDirSync).not.toHaveBeenCalledWith('/tmp/extensions/jira@1.1.0');
    expect(clack.log.success).toHaveBeenCalledWith(expect.stringContaining('2'));
  });

  it('should show message when nothing to clean', () => {
    vi.mocked(listInstalled).mockReturnValue([
      { name: 'jira', version: '1.0.0', registry_source: 'default', installed_at: '2026-01-01', type: 'standard' },
    ]);
    vi.mocked(fs.existsSync).mockReturnValue(true);
    vi.mocked(fs.readdirSync).mockReturnValueOnce(
      ['jira@1.0.0'] as unknown as ReturnType<typeof fs.readdirSync>,
    );

    handleExtCleanup({ db: {} as never });

    expect(removeDirSync).not.toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalledWith('No unused extension versions to clean up.');
  });

  it('should handle empty extensions directory', () => {
    vi.mocked(listInstalled).mockReturnValue([]);
    vi.mocked(fs.existsSync).mockReturnValue(false);

    handleExtCleanup({ db: {} as never });

    expect(clack.log.info).toHaveBeenCalledWith('No unused extension versions to clean up.');
  });
});
