import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthGate } from './AuthGate';

const mockFetchApi = vi.fn();
let capturedAuthListener: (() => void) | null = null;
const mockUnsubscribe = vi.fn();

vi.mock('@/core/api/client', () => ({
  fetchApi: (...args: unknown[]) => mockFetchApi(...args),
  onAuthFailure: (listener: () => void) => {
    capturedAuthListener = listener;
    return mockUnsubscribe;
  },
  ApiError: class ApiError extends Error {
    status: number;
    statusText: string;
    body: unknown;
    constructor(status: number, statusText: string, body: unknown) {
      super(`API Error ${status}: ${statusText}`);
      this.status = status;
      this.statusText = statusText;
      this.body = body;
    }
  },
}));

beforeEach(() => {
  mockFetchApi.mockReset();
  mockUnsubscribe.mockReset();
  capturedAuthListener = null;
});

describe('AuthGate', () => {
  it('renders children when not in LAN mode (status 404)', async () => {
    const { ApiError } = await import('@/core/api/client');
    mockFetchApi.mockRejectedValueOnce(new ApiError(404, 'Not Found', null));

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders children when LAN mode is active and authenticated', async () => {
    mockFetchApi.mockResolvedValueOnce({ lanMode: true, authenticated: true });

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();
  });

  it('renders PinPrompt when LAN mode is active and not authenticated', async () => {
    mockFetchApi.mockResolvedValueOnce({ lanMode: true, authenticated: false });

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('RenreKit Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders children when LAN mode is false', async () => {
    mockFetchApi.mockResolvedValueOnce({ lanMode: false, authenticated: false });

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();
  });

  it('switches to children after successful PIN entry', async () => {
    mockFetchApi
      .mockResolvedValueOnce({ lanMode: true, authenticated: false }) // initial status check
      .mockResolvedValueOnce(undefined); // PIN submission

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('RenreKit Dashboard')).toBeInTheDocument();

    const input = screen.getByLabelText('PIN');
    await userEvent.type(input, '1234');
    await userEvent.click(screen.getByText('Submit'));

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();
  });

  it('shows PinPrompt on mid-session auth failure', async () => {
    mockFetchApi.mockResolvedValueOnce({ lanMode: true, authenticated: true });

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();

    // Simulate mid-session auth failure
    expect(capturedAuthListener).not.toBeNull();
    act(() => {
      capturedAuthListener!();
    });

    await waitFor(() => {
      expect(screen.getByText('RenreKit Dashboard')).toBeInTheDocument();
    });
    expect(screen.queryByText('Dashboard Content')).not.toBeInTheDocument();
  });

  it('renders children when status check fails with network error', async () => {
    mockFetchApi.mockRejectedValueOnce(new Error('Network error'));

    render(
      <AuthGate>
        <div>Dashboard Content</div>
      </AuthGate>,
    );

    expect(await screen.findByText('Dashboard Content')).toBeInTheDocument();
  });
});
