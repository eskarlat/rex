import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockInit = vi
  .fn()
  .mockReturnValue({ id: 1, name: 'test', path: '/test', created_at: '', last_accessed_at: '' });

vi.mock('@clack/prompts', () => ({
  intro: vi.fn(),
  outro: vi.fn(),
  text: vi.fn(),
  select: vi.fn(),
  multiselect: vi.fn(),
  confirm: vi.fn().mockResolvedValue(false),
  isCancel: vi.fn().mockReturnValue(false),
  cancel: vi.fn(),
  log: { warn: vi.fn(), info: vi.fn(), error: vi.fn(), success: vi.fn() },
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
  getActivated: vi.fn().mockReturnValue({}),
}));

const mockHandleDoctor = vi.fn().mockResolvedValue(undefined);
vi.mock('../../doctor/commands/doctor.command.js', () => ({
  handleDoctor: (...args: unknown[]) => mockHandleDoctor(...args),
}));

vi.mock('../../../core/paths/paths.js', () => ({
  getExtensionDir: vi
    .fn()
    .mockImplementation((name: string, version: string) => `/mock/extensions/${name}@${version}`),
}));

import * as clack from '@clack/prompts';
import { handleInit } from './init.command.js';
import * as extensionManager from '../../extensions/manager/extension-manager.js';
import { ProjectAlreadyInitializedError } from '../../../core/types/errors.types.js';

describe('init command', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(clack.isCancel).mockReturnValue(false);
  });

  it('prompts for project name and agent dir, then calls projectManager.init', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.github');
    vi.mocked(clack.multiselect).mockResolvedValue([]);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.intro).toHaveBeenCalled();
    expect(clack.text).toHaveBeenCalled();
    expect(clack.select).toHaveBeenCalled();
    expect(mockInit).toHaveBeenCalledWith('my-project', '/tmp/test', '.github');
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
    vi.mocked(clack.select).mockResolvedValue('.github');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([]);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.multiselect).not.toHaveBeenCalled();
    expect(mockInit).toHaveBeenCalled();
  });

  it('shows multiselect when extensions are installed', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.github');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '',
        type: 'standard',
      },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(['ext-a']);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.multiselect).toHaveBeenCalled();
    expect(extensionManager.activate).toHaveBeenCalledWith(
      'ext-a',
      '1.0.0',
      '/tmp/test',
      expect.any(String),
    );
  });

  it('handles cancel on multiselect', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.github');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '',
        type: 'standard',
      },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(Symbol('cancel'));
    vi.mocked(clack.isCancel)
      .mockReturnValueOnce(false) // text check
      .mockReturnValueOnce(false) // select check
      .mockReturnValueOnce(true); // multiselect check

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(mockInit).toHaveBeenCalled();
    expect(extensionManager.activate).not.toHaveBeenCalled();
  });

  it('shows warning when project is already initialized', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.github');
    mockInit.mockImplementationOnce(() => {
      throw new ProjectAlreadyInitializedError('/tmp/test');
    });

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.log.warn).toHaveBeenCalledWith(expect.stringContaining('already initialized'));
    expect(clack.outro).toHaveBeenCalledWith('Nothing to do.');
    expect(extensionManager.activate).not.toHaveBeenCalled();
  });

  it('re-throws non-init errors from projectManager.init', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.github');
    mockInit.mockImplementationOnce(() => {
      throw new Error('Database is locked');
    });

    await expect(handleInit({ projectPath: '/tmp/test', force: false })).rejects.toThrow(
      'Database is locked',
    );
  });

  it('handles cancel on agent dir select', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue(Symbol('cancel'));
    vi.mocked(clack.isCancel)
      .mockReturnValueOnce(false) // text check
      .mockReturnValueOnce(true); // select check

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(clack.cancel).toHaveBeenCalled();
    expect(mockInit).not.toHaveBeenCalled();
  });

  it('activates multiple selected extensions', async () => {
    vi.mocked(clack.text).mockResolvedValue('my-project');
    vi.mocked(clack.select).mockResolvedValue('.agents');
    vi.mocked(extensionManager.listInstalled).mockReturnValue([
      {
        name: 'ext-a',
        version: '1.0.0',
        registry_source: 'default',
        installed_at: '',
        type: 'standard',
      },
      {
        name: 'ext-b',
        version: '2.0.0',
        registry_source: 'default',
        installed_at: '',
        type: 'mcp',
      },
    ]);
    vi.mocked(clack.multiselect).mockResolvedValue(['ext-a', 'ext-b']);

    await handleInit({ projectPath: '/tmp/test', force: false });

    expect(extensionManager.activate).toHaveBeenCalledTimes(2);
  });

  describe('post-init doctor prompt', () => {
    it('runs doctor when user accepts', async () => {
      vi.mocked(clack.text).mockResolvedValue('my-project');
      vi.mocked(clack.select).mockResolvedValue('.github');
      vi.mocked(clack.confirm).mockResolvedValue(true);

      await handleInit({ projectPath: '/tmp/test', force: false });

      expect(clack.confirm).toHaveBeenCalledWith(
        expect.objectContaining({ message: expect.stringContaining('diagnostic') }),
      );
      expect(mockHandleDoctor).toHaveBeenCalledWith('/tmp/test', expect.any(Function));
    });

    it('skips doctor when user declines', async () => {
      vi.mocked(clack.text).mockResolvedValue('my-project');
      vi.mocked(clack.select).mockResolvedValue('.github');
      vi.mocked(clack.confirm).mockResolvedValue(false);

      await handleInit({ projectPath: '/tmp/test', force: false });

      expect(mockHandleDoctor).not.toHaveBeenCalled();
    });

    it('skips doctor when user cancels confirm', async () => {
      vi.mocked(clack.text).mockResolvedValue('my-project');
      vi.mocked(clack.select).mockResolvedValue('.github');
      const cancelSymbol = Symbol('cancel');
      vi.mocked(clack.confirm).mockResolvedValue(cancelSymbol);
      vi.mocked(clack.isCancel).mockImplementation((val) => val === cancelSymbol);

      await handleInit({ projectPath: '/tmp/test', force: false });

      expect(mockHandleDoctor).not.toHaveBeenCalled();
    });
  });
});
