import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInit = vi.fn().mockReturnValue({ id: 1, name: 'test', path: '/test', created_at: '', last_accessed_at: '' });

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  multiselect: vi.fn(),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
}));

vi.mock('../../../core/project/project-manager.js', () => ({
  ProjectManager: vi.fn().mockImplementation(() => ({
    init: mockInit,
  })),
}));

vi.mock('../../../core/event-bus/event-bus.js', () => ({
  EventBus: vi.fn().mockImplementation(() => ({})),
}));

vi.mock('../../../core/database/database.js', () => ({
  getDb: vi.fn().mockReturnValue({}),
}));

vi.mock('../../extensions/manager/extension-manager.js', () => ({
  listInstalled: vi.fn().mockReturnValue([]),
  activate: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  getExtensionDir: vi.fn().mockImplementation((name: string, version: string) => `/mock/extensions/${name}/${version}`),
}));

import * as clack from '@clack/prompts';
import { handleInit } from './init.command.js';
import * as extensionManager from '../../extensions/manager/extension-manager.js';

describe('init command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clack.isCancel).mockReturnValue(false);
  });

  it('prompts for project name and calls projectManager.init', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.multiselect).mockResolvedValue([]);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.intro).toHaveBeenCalled();
    expect(clack.text).toHaveBeenCalled();
    expect(mockInit).toHaveBeenCalledWith('my-project', '/tmp/test');
    expect(clack.outro).toHaveBeenCalled();
  });

  it('handles user cancellation on name prompt', async () => {
    vi.mocked(clack.text).mockResolvedValue(Symbol('cancel'));
    vi.mocked(clack.isCancel).mockReturnValue(true);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.cancel).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('skips multiselect when no extensions installed', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([]);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.multiselect).not.toHaveBeenCalled();
    expect(mockInit).toHaveBeenCalled();
  });

  it('shows multiselect when extensions are installed', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(['ext-a']);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.multiselect).toHaveBeenCalled();
    expect(extensionManager.activate).toHaveBeenCalledWith(
      'ext-a', '1.0.0', '/tmp/test', expect.any(String),
    );
  });

  it('handles cancel on multiselect', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(Symbol('cancel'));
    vi.mocked(clack.isCancel)
      .mockReturnValueOnce(false) // text check
      .mockReturnValueOnce(true); // multiselect check

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(mockInit).toHaveBeenCalled();
    expect(extensionManager.activate).not.toHaveBeenCalled();
  });

  it('activates multiple selected extensions', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      { name: 'ext-a', version: '1.0.0', registry_source: 'default', installed_at: '', type: 'standard' },
      { name: 'ext-b', version: '2.0.0', registry_source: 'default', installed_at: '', type: 'mcp' },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(['ext-a', 'ext-b']);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(extensionManager.activate).toHaveBeenCalledTimes(2);
  });
});
