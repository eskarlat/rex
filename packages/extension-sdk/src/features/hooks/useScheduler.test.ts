import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useScheduler } from './useScheduler';
import type { RenreKitSDK, ScheduledTask } from '../../core/types';

const mockTask: ScheduledTask = {
  id: 'task-1',
  name: 'test-ext',
  type: 'extension',
  project_path: '/test',
  cron: '0 * * * *',
  command: 'echo hello',
  enabled: 1,
  last_run_at: null,
  last_status: null,
  next_run_at: '2026-01-01T01:00:00Z',
  created_at: '2026-01-01T00:00:00Z',
};

function createMockSDK(): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), publish: vi.fn() },
    scheduler: {
      list: vi.fn().mockResolvedValue([]),
      register: vi.fn().mockResolvedValue(mockTask),
      unregister: vi.fn().mockResolvedValue(undefined),
      update: vi.fn().mockResolvedValue(mockTask),
    },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    notify: vi.fn(),
    destroy: vi.fn(),
  };
}

describe('useScheduler', () => {
  let mockSDK: RenreKitSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
  });

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return createElement(SDKProvider, { sdk: mockSDK }, children);
  }

  it('fetches tasks on mount', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    expect(mockSDK.scheduler.list).toHaveBeenCalled();
    expect(result.current.tasks).toEqual([mockTask]);
  });

  it('register calls SDK and refreshes list', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([]);
    vi.mocked(mockSDK.scheduler.register).mockResolvedValue(mockTask);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    let created: ScheduledTask | undefined;
    await act(async () => {
      created = await result.current.register({
        extension_name: 'test-ext',
        cron: '0 * * * *',
        command: 'echo hello',
      });
    });

    expect(created).toEqual(mockTask);
    expect(mockSDK.scheduler.register).toHaveBeenCalled();
    expect(result.current.tasks).toEqual([mockTask]);
  });

  it('remove calls SDK unregister and refreshes list', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([]);

    await act(async () => {
      await result.current.remove('task-1');
    });

    expect(mockSDK.scheduler.unregister).toHaveBeenCalledWith('task-1');
    expect(result.current.tasks).toEqual([]);
  });

  it('trigger calls SDK update and refreshes list', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    await act(async () => {
      await result.current.trigger('task-1');
    });

    expect(mockSDK.scheduler.update).toHaveBeenCalledWith('task-1', {});
  });

  it('update calls SDK and refreshes list', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    const updatedTask = { ...mockTask, cron: '*/5 * * * *' };
    vi.mocked(mockSDK.scheduler.update).mockResolvedValue(updatedTask);
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([updatedTask]);

    let updated: ScheduledTask | undefined;
    await act(async () => {
      updated = await result.current.update('task-1', { cron: '*/5 * * * *' });
    });

    expect(updated).toEqual(updatedTask);
    expect(mockSDK.scheduler.update).toHaveBeenCalledWith('task-1', { cron: '*/5 * * * *' });
    expect(result.current.tasks).toEqual([updatedTask]);
  });

  it('refresh re-fetches tasks', async () => {
    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([]);

    const { result } = renderHook(() => useScheduler(), { wrapper });

    await act(async () => {
      // Let mount effect resolve
    });

    expect(result.current.tasks).toEqual([]);

    vi.mocked(mockSDK.scheduler.list).mockResolvedValue([mockTask]);

    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.tasks).toEqual([mockTask]);
  });
});
