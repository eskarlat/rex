import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RenreKitSDKImpl } from './sdk';
import type {
  SDKEventHandler,
  SDKEventPayload,
  ScheduledTask,
  CreateTaskPayload,
  UpdateTaskPayload,
} from './types';

// Mock ApiClient
const mockGetProject = vi.fn();
const mockRunCommand = vi.fn();
const mockGetStorageValue = vi.fn();
const mockSetStorage = vi.fn();
const mockDeleteStorage = vi.fn();
const mockListStorage = vi.fn();
const mockGetScheduledTasks = vi.fn();
const mockCreateTask = vi.fn();
const mockDeleteTask = vi.fn();
const mockUpdateTask = vi.fn();

vi.mock('./api-client', () => ({
  ApiClient: vi.fn().mockImplementation(() => ({
    getProject: mockGetProject,
    runCommand: mockRunCommand,
    getStorageValue: mockGetStorageValue,
    setStorage: mockSetStorage,
    deleteStorage: mockDeleteStorage,
    listStorage: mockListStorage,
    getScheduledTasks: mockGetScheduledTasks,
    createTask: mockCreateTask,
    deleteTask: mockDeleteTask,
    updateTask: mockUpdateTask,
  })),
}));

// Mock globalThis.confirm for ui.confirm tests
const mockConfirm = vi.fn();
vi.stubGlobal('confirm', mockConfirm);

describe('RenreKitSDKImpl', () => {
  let sdk: RenreKitSDKImpl;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = new RenreKitSDKImpl(
      { baseUrl: 'http://localhost:4200', projectPath: '/my/project' },
      'test-ext'
    );
  });

  describe('project', () => {
    it('returns null name and empty config before refresh', () => {
      expect(sdk.project.name).toBeNull();
      expect(sdk.project.config).toEqual({});
    });

    it('returns projectPath from config', () => {
      expect(sdk.project.path).toBe('/my/project');
    });

    it('returns null path when projectPath not provided', () => {
      const noPathSdk = new RenreKitSDKImpl({ baseUrl: 'http://localhost:4200' });
      expect(noPathSdk.project.path).toBeNull();
    });

    it('populates name and config after refresh', async () => {
      mockGetProject.mockResolvedValueOnce({
        name: 'my-project',
        path: '/my/project',
        config: { foo: 'bar' },
      });

      await sdk.project.refresh();

      expect(sdk.project.name).toBe('my-project');
      expect(sdk.project.config).toEqual({ foo: 'bar' });
    });

    it('updates cached data on subsequent refreshes', async () => {
      mockGetProject.mockResolvedValueOnce({
        name: 'first',
        path: '/my/project',
        config: { a: 1 },
      });
      await sdk.project.refresh();
      expect(sdk.project.name).toBe('first');

      mockGetProject.mockResolvedValueOnce({
        name: 'second',
        path: '/my/project',
        config: { b: 2 },
      });
      await sdk.project.refresh();
      expect(sdk.project.name).toBe('second');
      expect(sdk.project.config).toEqual({ b: 2 });
    });
  });

  describe('exec', () => {
    it('delegates run to ApiClient.runCommand', async () => {
      const result = { output: 'hello', exitCode: 0 };
      mockRunCommand.mockResolvedValueOnce(result);

      const actual = await sdk.exec.run('ext:list', { verbose: true });

      expect(mockRunCommand).toHaveBeenCalledWith('ext:list', { verbose: true });
      expect(actual).toEqual(result);
    });

    it('passes undefined args when omitted', async () => {
      mockRunCommand.mockResolvedValueOnce({ output: '', exitCode: 0 });

      await sdk.exec.run('status');

      expect(mockRunCommand).toHaveBeenCalledWith('status', undefined);
    });
  });

  describe('storage', () => {
    it('gets a storage value by key', async () => {
      mockGetStorageValue.mockResolvedValueOnce('my-value');

      const value = await sdk.storage.get('my-key');

      expect(mockGetStorageValue).toHaveBeenCalledWith('test-ext', 'my-key');
      expect(value).toBe('my-value');
    });

    it('returns null for missing keys', async () => {
      mockGetStorageValue.mockResolvedValueOnce(null);

      const value = await sdk.storage.get('nonexistent');

      expect(value).toBeNull();
    });

    it('sets a storage value', async () => {
      mockSetStorage.mockResolvedValueOnce(undefined);

      await sdk.storage.set('key', 'value');

      expect(mockSetStorage).toHaveBeenCalledWith('test-ext', 'key', 'value');
    });

    it('deletes a storage key', async () => {
      mockDeleteStorage.mockResolvedValueOnce(undefined);

      await sdk.storage.delete('key');

      expect(mockDeleteStorage).toHaveBeenCalledWith('test-ext', 'key');
    });

    it('lists all storage entries', async () => {
      const entries = [
        { key: 'a', value: '1' },
        { key: 'b', value: '2' },
      ];
      mockListStorage.mockResolvedValueOnce(entries);

      const result = await sdk.storage.list();

      expect(mockListStorage).toHaveBeenCalledWith('test-ext');
      expect(result).toEqual(entries);
    });
  });

  describe('ui', () => {
    it('does nothing when toast is called without a handler', () => {
      // Should not throw
      sdk.ui.toast({ title: 'Hello' });
    });

    it('calls registered toast handler', () => {
      const handler = vi.fn();
      sdk.ui.setToastHandler(handler);

      sdk.ui.toast({ title: 'Success', variant: 'default' });

      expect(handler).toHaveBeenCalledWith({ title: 'Success', variant: 'default' });
    });

    it('confirms via globalThis.confirm', async () => {
      mockConfirm.mockReturnValueOnce(true);

      const result = await sdk.ui.confirm('Are you sure?');

      expect(mockConfirm).toHaveBeenCalledWith('Are you sure?');
      expect(result).toBe(true);
    });

    it('returns false when user cancels confirm', async () => {
      mockConfirm.mockReturnValueOnce(false);

      const result = await sdk.ui.confirm('Delete?');

      expect(result).toBe(false);
    });

    it('does nothing when navigate is called without a handler', () => {
      // Should not throw
      sdk.ui.navigate('/settings');
    });

    it('calls registered navigate handler', () => {
      const handler = vi.fn();
      sdk.ui.setNavigateHandler(handler);

      sdk.ui.navigate('/extensions');

      expect(handler).toHaveBeenCalledWith('/extensions');
    });
  });

  describe('events', () => {
    it('registers and emits events', () => {
      const handler = vi.fn();
      sdk.events.on('project:init', handler);

      const payload: SDKEventPayload = { type: 'project:init', detail: 'test' };
      sdk.events.emit('project:init', payload);

      expect(handler).toHaveBeenCalledWith(payload);
    });

    it('supports multiple handlers for the same event', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      sdk.events.on('ext:activate', handler1);
      sdk.events.on('ext:activate', handler2);

      const payload: SDKEventPayload = { type: 'ext:activate' };
      sdk.events.emit('ext:activate', payload);

      expect(handler1).toHaveBeenCalledWith(payload);
      expect(handler2).toHaveBeenCalledWith(payload);
    });

    it('does not fire handlers for different event types', () => {
      const handler = vi.fn();
      sdk.events.on('project:init', handler);

      sdk.events.emit('project:destroy', { type: 'project:destroy' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('removes a handler with off', () => {
      const handler = vi.fn();
      sdk.events.on('project:init', handler);
      sdk.events.off('project:init', handler);

      sdk.events.emit('project:init', { type: 'project:init' });

      expect(handler).not.toHaveBeenCalled();
    });

    it('off is safe to call for unregistered events', () => {
      const handler: SDKEventHandler = vi.fn();
      // Should not throw
      sdk.events.off('ext:deactivate', handler);
    });

    it('emit is safe to call with no registered handlers', () => {
      // Should not throw
      sdk.events.emit('project:init', { type: 'project:init' });
    });
  });

  describe('scheduler', () => {
    const mockTask: ScheduledTask = {
      id: '1',
      name: 'test-ext',
      type: 'extension',
      project_path: '/my/project',
      cron: '0 * * * *',
      command: 'sync',
      enabled: 1,
      last_run_at: null,
      last_status: null,
      next_run_at: '2026-03-17T01:00:00Z',
      created_at: '2026-03-17T00:00:00Z',
    };

    it('lists scheduled tasks', async () => {
      mockGetScheduledTasks.mockResolvedValueOnce([mockTask]);

      const result = await sdk.scheduler.list();

      expect(mockGetScheduledTasks).toHaveBeenCalled();
      expect(result).toEqual([mockTask]);
    });

    it('registers a new task', async () => {
      const payload: CreateTaskPayload = {
        extension_name: 'test-ext',
        cron: '0 * * * *',
        command: 'sync',
      };
      mockCreateTask.mockResolvedValueOnce(mockTask);

      const result = await sdk.scheduler.register(payload);

      expect(mockCreateTask).toHaveBeenCalledWith(payload);
      expect(result).toEqual(mockTask);
    });

    it('unregisters a task', async () => {
      mockDeleteTask.mockResolvedValueOnce(undefined);

      await sdk.scheduler.unregister('1');

      expect(mockDeleteTask).toHaveBeenCalledWith('1');
    });

    it('updates a task', async () => {
      const payload: UpdateTaskPayload = { enabled: 0 };
      const updated = { ...mockTask, enabled: 0 };
      mockUpdateTask.mockResolvedValueOnce(updated);

      const result = await sdk.scheduler.update('1', payload);

      expect(mockUpdateTask).toHaveBeenCalledWith('1', payload);
      expect(result).toEqual(updated);
    });
  });

  describe('terminal', () => {
    it('does nothing when open is called without a handler', () => {
      // Should not throw
      sdk.terminal.open();
    });

    it('does nothing when close is called without a handler', () => {
      // Should not throw
      sdk.terminal.close();
    });

    it('does nothing when send is called without a handler', () => {
      // Should not throw
      sdk.terminal.send('ls\n');
    });

    it('calls registered open handler', () => {
      const handler = vi.fn();
      sdk.terminal.setOpenHandler(handler);

      sdk.terminal.open();

      expect(handler).toHaveBeenCalledOnce();
    });

    it('calls registered close handler', () => {
      const handler = vi.fn();
      sdk.terminal.setCloseHandler(handler);

      sdk.terminal.close();

      expect(handler).toHaveBeenCalledOnce();
    });

    it('calls registered send handler with data', () => {
      const handler = vi.fn();
      sdk.terminal.setSendHandler(handler);

      sdk.terminal.send('echo hello\n');

      expect(handler).toHaveBeenCalledWith('echo hello\n');
    });
  });

  describe('destroy', () => {
    it('clears all event handlers', () => {
      const handler1 = vi.fn();
      const handler2 = vi.fn();
      sdk.events.on('project:init', handler1);
      sdk.events.on('ext:activate', handler2);

      sdk.destroy();

      sdk.events.emit('project:init', { type: 'project:init' });
      sdk.events.emit('ext:activate', { type: 'ext:activate' });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).not.toHaveBeenCalled();
    });
  });
});
