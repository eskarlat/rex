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
    events: { on: vi.fn(), off: vi.fn(), emit: vi.fn(), publish: vi.fn() },
    scheduler: { list: vi.fn(), register: vi.fn(), unregister: vi.fn(), update: vi.fn() },
    terminal: { open: vi.fn(), close: vi.fn(), send: vi.fn() },
    logger: { debug: vi.fn(), info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    notify: vi.fn(),
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
    const { result } = renderHook(() => useCommand('my-ext', 'status'), { wrapper });
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('execute calls sdk with namespaced command', async () => {
    const commandResult: CommandResult = { output: 'hello world', exitCode: 0 };
    vi.mocked(mockSDK.exec.run).mockResolvedValue(commandResult);

    const { result } = renderHook(() => useCommand('my-ext', 'greet'), { wrapper });

    await act(async () => {
      await result.current.execute();
    });

    expect(mockSDK.exec.run).toHaveBeenCalledWith('my-ext:greet', undefined);
    expect(result.current.result).toEqual(commandResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('execute passes args to sdk.exec.run', async () => {
    const commandResult: CommandResult = { output: 'done', exitCode: 0 };
    vi.mocked(mockSDK.exec.run).mockResolvedValue(commandResult);

    const { result } = renderHook(() => useCommand('my-ext', 'build'), { wrapper });

    await act(async () => {
      await result.current.execute({ verbose: true });
    });

    expect(mockSDK.exec.run).toHaveBeenCalledWith('my-ext:build', { verbose: true });
  });

  it('execute sets error on failure', async () => {
    vi.mocked(mockSDK.exec.run).mockRejectedValue(new Error('command failed'));

    const { result } = renderHook(() => useCommand('my-ext', 'bad'), { wrapper });

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('command failed');
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
  });

  it('execute wraps non-Error thrown values into Error', async () => {
    vi.mocked(mockSDK.exec.run).mockRejectedValue('string error');

    const { result } = renderHook(() => useCommand('my-ext', 'bad'), { wrapper });

    await act(async () => {
      await result.current.execute();
    });

    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe('string error');
  });

  it('loading toggles during execution', async () => {
    let resolveRun!: (value: CommandResult) => void;
    vi.mocked(mockSDK.exec.run).mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveRun = resolve;
        }),
    );

    const { result } = renderHook(() => useCommand('my-ext', 'slow'), { wrapper });

    let runPromise: Promise<void>;
    await act(async () => {
      runPromise = result.current.execute();
    });

    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolveRun({ output: 'done', exitCode: 0 });
      await runPromise!;
    });

    expect(result.current.loading).toBe(false);
  });
});
