import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { SDKProvider } from '../context/SDKProvider';
import { useCommand } from './useCommand';
import type { RenreKitSDK, CommandResult } from '../../core/types';

function createMockSDK(overrides?: Partial<RenreKitSDK>): RenreKitSDK {
  return {
    project: { name: null, path: null, config: {}, refresh: vi.fn() },
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn(), list: vi.fn() },
    ui: { toast: vi.fn(), confirm: vi.fn(), navigate: vi.fn() },
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    destroy: vi.fn(),
    ...overrides,
  };
}

describe('useCommand', () => {
  let mockSDK: RenreKitSDK;

  beforeEach(() => {
    mockSDK = createMockSDK();
  });

  function wrapper({ children }: { children: ReactNode }): ReactNode {
    return createElement(SDKProvider, { sdk: mockSDK }, children);
  }

  it('starts with default state', () => {
    const { result } = renderHook(() => useCommand(), { wrapper });
    expect(result.current.output).toBeNull();
    expect(result.current.isRunning).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('run updates output on success', async () => {
    const commandResult: CommandResult = { output: 'hello world', exitCode: 0 };
    vi.mocked(mockSDK.exec.run).mockResolvedValue(commandResult);

    const { result } = renderHook(() => useCommand(), { wrapper });

    await act(async () => {
      await result.current.run('echo hello');
    });

    expect(mockSDK.exec.run).toHaveBeenCalledWith('echo hello', undefined);
    expect(result.current.output).toBe('hello world');
    expect(result.current.isRunning).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('run passes args to sdk.exec.run', async () => {
    const commandResult: CommandResult = { output: 'done', exitCode: 0 };
    vi.mocked(mockSDK.exec.run).mockResolvedValue(commandResult);

    const { result } = renderHook(() => useCommand(), { wrapper });

    await act(async () => {
      await result.current.run('build', { verbose: true });
    });

    expect(mockSDK.exec.run).toHaveBeenCalledWith('build', { verbose: true });
  });

  it('run sets error on failure', async () => {
    vi.mocked(mockSDK.exec.run).mockRejectedValue(new Error('command failed'));

    const { result } = renderHook(() => useCommand(), { wrapper });

    await act(async () => {
      await result.current.run('bad-command');
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('command failed');
    expect(result.current.output).toBeNull();
    expect(result.current.isRunning).toBe(false);
  });

  it('isRunning toggles during execution', async () => {
    let resolveRun!: (value: CommandResult) => void;
    vi.mocked(mockSDK.exec.run).mockImplementation(
      () => new Promise((resolve) => { resolveRun = resolve; }),
    );

    const { result } = renderHook(() => useCommand(), { wrapper });

    let runPromise: Promise<void>;
    await act(async () => {
      runPromise = result.current.run('slow-command');
    });

    expect(result.current.isRunning).toBe(true);

    await act(async () => {
      resolveRun({ output: 'done', exitCode: 0 });
      await runPromise!;
    });

    expect(result.current.isRunning).toBe(false);
  });
});
