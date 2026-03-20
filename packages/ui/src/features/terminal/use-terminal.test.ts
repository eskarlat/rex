import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement } from 'react';
import type { ReactNode } from 'react';
import { TerminalProvider, useTerminal } from './use-terminal';

function createWrapper() {
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(TerminalProvider, null, children);
  };
}

describe('useTerminal', () => {
  it('throws when used outside TerminalProvider', () => {
    expect(() => {
      renderHook(() => useTerminal());
    }).toThrow('useTerminal must be used within a TerminalProvider');
  });

  it('starts with isOpen false', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('open sets isOpen to true', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.open();
    });

    expect(result.current.isOpen).toBe(true);
  });

  it('close sets isOpen to false', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.open();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle flips isOpen', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isOpen).toBe(false);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('send does nothing when no sender is registered', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    // Should not throw
    act(() => {
      result.current.send('echo hello');
    });
  });

  it('send calls the registered sender', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    const sender = vi.fn();
    act(() => {
      result.current.registerSender(sender);
    });

    act(() => {
      result.current.send('ls\n');
    });

    expect(sender).toHaveBeenCalledWith('ls\n');
  });

  it('unregisterSender stops send from calling the sender', () => {
    const { result } = renderHook(() => useTerminal(), {
      wrapper: createWrapper(),
    });

    const sender = vi.fn();
    act(() => {
      result.current.registerSender(sender);
    });
    act(() => {
      result.current.unregisterSender();
    });
    act(() => {
      result.current.send('ls\n');
    });

    expect(sender).not.toHaveBeenCalled();
  });
});
