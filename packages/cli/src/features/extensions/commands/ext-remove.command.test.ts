import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@clack/prompts', () => ({
  log: { info: vi.fn(), success: vi.fn(), warn: vi.fn(), error: vi.fn() },
  confirm: vi.fn().mockResolvedValue(true),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

vi.mock('../manager/extension-manager.js', () => ({
  remove: vi.fn(),
  deactivate: vi.fn().mockResolvedValue(undefined),
  getActivated: vi.fn().mockReturnValue({}),
}));

const mockPrepare = vi.fn().mockReturnValue({ all: vi.fn().mockReturnValue([]) });
vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({ prepare: (...args: unknown[]) => mockPrepare(...args) }),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  getExtensionDir: vi.fn().mockImplementation((name: string, version: string) => `/mock/extensions/${name}@${version}`),
}));

import * as clack from '@clack/prompts';
import { handleExtRemove } from './ext-remove.command.js';
import * as extensionManager from '../manager/extension-manager.js';

describe('ext-remove command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPrepare.mockReturnValue({ all: vi.fn().mockReturnValue([]) });
  });

  it('removes extension from DB', async () => {
    await handleExtRemove({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: null,
    });

    expect(extensionManager.remove).toHaveBeenCalledWith('my-ext', '1.0.0', expect.anything());
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('deactivates from project before removing', async () => {
    await handleExtRemove({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: '/tmp/project',
    });

    expect(extensionManager.deactivate).toHaveBeenCalled();
    expect(extensionManager.remove).toHaveBeenCalled();
    expect(clack.log.info).toHaveBeenCalled();
  });

  it('warns and continues when deactivation fails', async () => {
    vi.mocked(extensionManager.deactivate).mockRejectedValue(new Error('hook crash'));

    await handleExtRemove({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: '/tmp/project',
    });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('Could not deactivate'));
    expect(extensionManager.remove).toHaveBeenCalled();
  });

  it('warns when other projects use the extension', async () => {
    mockPrepare.mockReturnValue({
      all: vi.fn().mockReturnValue([
        { name: 'other-project', path: '/other/project' },
      ]),
    });
    vi.mocked(extensionManager.getActivated).mockReturnValue({ 'my-ext': '1.0.0' });

    await handleExtRemove({
      name: 'my-ext',
      version: '1.0.0',
      projectPath: '/tmp/project',
    });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('still used by'));
    expect(extensionManager.remove).toHaveBeenCalled();
  });
});
