import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn() },
}));

vi.mock('../manager/extension-manager.js', () => ({
  status: vi.fn(),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

import * as clack from '@clack/prompts';
import { handleExtList } from './ext-list.command.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-list command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays installed extensions and status', () => {
    vi.mocked(extensionManager.status).mockReturnValue([
      { name: 'ext-a', version: '1.0.0', type: 'standard', activatedInProject: true, activatedVersion: '1.0.0' },
      { name: 'ext-b', version: '2.0.0', type: 'mcp', activatedInProject: false, activatedVersion: null },
    ]);

    handleExtList({ projectPath: '/tmp/project' });

    expect(extensionManager.status).toHaveBeenCalledWith('/tmp/project', expect.anything());
    expect(clack.log.info).toHaveBeenCalled();
  });

  it('shows message when no extensions installed', () => {
    vi.mocked(extensionManager.status).mockReturnValue([]);

    handleExtList({ projectPath: '/tmp/project' });

    expect(clack.log.info).toHaveBeenCalledWith(expect.stringContaining('No extensions'));
  });
});
