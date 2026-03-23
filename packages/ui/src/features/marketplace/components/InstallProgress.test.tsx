import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { renderHook } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createElement, type ReactNode } from 'react';

const mockGetActiveProjectPath = vi.fn();
const mockShowToast = vi.fn();

vi.mock('@/core/api/client', () => ({
  getActiveProjectPath: () => mockGetActiveProjectPath(),
}));

vi.mock('@/core/hooks/use-toast', () => ({
  showToast: (...args: unknown[]) => mockShowToast(...args),
}));

import { InstallProgressBar, useInstallProgress } from './InstallProgress';
import type { InstallProgressState } from './InstallProgress';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return function Wrapper({ children }: { children: ReactNode }) {
    return createElement(QueryClientProvider, { client: qc }, children);
  };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe('InstallProgressBar', () => {
  it('renders idle state with 0% progress', () => {
    const state: InstallProgressState = { step: 'idle', extensionName: null };
    render(<InstallProgressBar state={state} />);
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders resolving state with 15% progress', () => {
    const state: InstallProgressState = { step: 'resolving', extensionName: 'ext' };
    render(<InstallProgressBar state={state} />);
    expect(screen.getByText('Resolving...')).toBeInTheDocument();
    expect(screen.getByText('15%')).toBeInTheDocument();
  });

  it('renders downloading state with 50% progress', () => {
    const state: InstallProgressState = { step: 'downloading', extensionName: 'ext' };
    render(<InstallProgressBar state={state} />);
    expect(screen.getByText('Downloading...')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  it('renders done state with 100% progress', () => {
    const state: InstallProgressState = { step: 'done', extensionName: 'ext' };
    render(<InstallProgressBar state={state} />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('renders error state', () => {
    const state: InstallProgressState = { step: 'error', extensionName: 'ext' };
    render(<InstallProgressBar state={state} />);
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});

describe('useInstallProgress', () => {
  it('starts with idle state', () => {
    const { result } = renderHook(() => useInstallProgress(), { wrapper: createWrapper() });
    expect(result.current.state.step).toBe('idle');
    expect(result.current.state.extensionName).toBeNull();
  });

  it('handles successful SSE install', async () => {
    mockGetActiveProjectPath.mockReturnValue('/my/project');

    const chunks = [
      new TextEncoder().encode('data: {"step":"downloading"}\n\n'),
      new TextEncoder().encode('data: {"step":"installing"}\n\n'),
    ];
    let chunkIdx = 0;

    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (chunkIdx < chunks.length) {
          const value = chunks[chunkIdx++];
          return Promise.resolve({ done: false, value });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
      statusText: 'OK',
    } as unknown as Response);

    const { result } = renderHook(() => useInstallProgress(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.startInstall('my-ext');
    });

    expect(mockShowToast).toHaveBeenCalledWith({ title: 'Installed my-ext' });
  });

  it('handles fetch failure', async () => {
    mockGetActiveProjectPath.mockReturnValue(null);

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: false,
      body: null,
      statusText: 'Internal Server Error',
    } as unknown as Response);

    const { result } = renderHook(() => useInstallProgress(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.startInstall('my-ext');
    });

    await waitFor(() => {
      expect(result.current.state.step).toBe('error');
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'Failed to install my-ext', variant: 'destructive' }),
    );
  });

  it('handles SSE error event', async () => {
    mockGetActiveProjectPath.mockReturnValue(null);

    const chunk = new TextEncoder().encode('data: {"step":"error","error":"disk full"}\n\n');
    let called = false;

    const mockReader = {
      read: vi.fn().mockImplementation(() => {
        if (!called) {
          called = true;
          return Promise.resolve({ done: false, value: chunk });
        }
        return Promise.resolve({ done: true, value: undefined });
      }),
    };

    vi.spyOn(globalThis, 'fetch').mockResolvedValue({
      ok: true,
      body: { getReader: () => mockReader },
      statusText: 'OK',
    } as unknown as Response);

    const { result } = renderHook(() => useInstallProgress(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.startInstall('my-ext');
    });

    await waitFor(() => {
      expect(result.current.state.step).toBe('error');
    });
    expect(mockShowToast).toHaveBeenCalledWith(
      expect.objectContaining({ description: 'disk full', variant: 'destructive' }),
    );
  });
});
