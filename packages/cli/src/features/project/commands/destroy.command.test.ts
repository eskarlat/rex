import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDestroy = vi.fn();

vi.mock('@clack/prompts', () => ({
  confirm: vi.fn(),
  log: { warn: vi.fn(), success: vi.fn() },
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

vi.mock('../../../core/project/project-manager.js', () => ({
  ProjectManager: vi.fn().mockImplementation(() => ({
    destroy: mockDestroy,
  })),
}));

vi.mock('../../../core/event-bus/event-bus.js', () => ({
  EventBus: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../../extensions/manager/extension-manager.js', () => ({
  getActivated: vi.fn().mockReturnValue({}),
  deactivate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  getExtensionDir: vi
    .fn()
    .mockImplementation((name: string, version: string) => `/mock/extensions/${name}@${version}`),
  getManifestPath: vi.fn().mockReturnValue('/tmp/test/.renre-kit/manifest.json'),
}));

vi.mock('../../../shared/fs-helpers.js', () => ({
  pathExistsSync: vi.fn().mockReturnValue(false),
  readJsonSync: vi.fn().mockReturnValue({}),
}));

import * as clack from '@clack/prompts';
import { handleDestroy } from './destroy.command.js';
import * as extensionManager from '../../extensions/manager/extension-manager.js';

describe('destroy command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clack.isCancel).mockReturnValue(false);
  });

  it('confirms before destroying', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(true);

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(clack.confirm).toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalledWith('/tmp/test', true);
    expect(clack.log.success).toHaveBeenCalled();
  });

  it('skips confirmation with --force', async () => {
    await handleDestroy({ projectPath: '/tmp/test', force: true });

    expect(clack.confirm).not.toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('aborts on negative confirm', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(false);

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it('handles user cancel symbol', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(Symbol('cancel') as unknown as boolean);
    vi.mocked(clack.isCancel).mockReturnValue(true);

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(clack.cancel).toHaveBeenCalled();
    expect(mockDestroy).not.toHaveBeenCalled();
  });

  it('deactivates extensions before destroying', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(true);
    vi.mocked(extensionManager.getActivated).mockReturnValue({
      'ext-a': '1.0.0',
      'ext-b': '2.0.0',
    });

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(extensionManager.deactivate).toHaveBeenCalledTimes(2);
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('skips extensions with empty version in plugins', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(true);
    vi.mocked(extensionManager.getActivated).mockReturnValue({
      'ext-empty': '',
    });

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(extensionManager.deactivate).not.toHaveBeenCalled();
    expect(mockDestroy).toHaveBeenCalled();
  });

  it('continues destroying even if deactivation fails', async () => {
    vi.mocked(clack.confirm).mockResolvedValue(true);
    vi.mocked(extensionManager.getActivated).mockReturnValue({
      'ext-a': '1.0.0',
    });
    vi.mocked(extensionManager.deactivate).mockRejectedValue(new Error('hook crash'));

    await handleDestroy({ projectPath: '/tmp/test', force: false });

    expect(mockDestroy).toHaveBeenCalled();
  });
});
