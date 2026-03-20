import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PlaywrightPanel from './panel.js';

const NAVIGATE_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'Navigated to https://example.com' }],
});

const SNAPSHOT_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: '- heading "Example Domain"\n- link "More information..."' }],
});

function createMockSdk(overrides: Record<string, unknown> = {}) {
  return {
    exec: {
      run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
    },
    storage: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}

describe('PlaywrightPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and description', () => {
    render(<PlaywrightPanel />);
    expect(screen.getByText('Playwright')).toBeInTheDocument();
    expect(screen.getByText(/browser automation/i)).toBeInTheDocument();
  });

  it('renders URL input and Go button', () => {
    render(<PlaywrightPanel />);
    expect(screen.getByPlaceholderText(/url/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<PlaywrightPanel />);
    expect(screen.getByText('Playwright')).toBeInTheDocument();
  });

  it('calls browser_navigate on Go click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.type(screen.getByPlaceholderText(/url/i), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('playwright-mcp:browser_navigate', {
        url: 'https://example.com',
      });
    });
  });

  it('displays result after navigation', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.type(screen.getByPlaceholderText(/url/i), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(screen.getByText(/Navigated to/)).toBeInTheDocument();
    });
  });

  it('calls browser_snapshot on Take Snapshot click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SNAPSHOT_RESPONSE, exitCode: 0 });

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.click(screen.getByRole('button', { name: /take snapshot/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('playwright-mcp:browser_snapshot');
    });
  });

  it('displays snapshot result', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SNAPSHOT_RESPONSE, exitCode: 0 });

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.click(screen.getByRole('button', { name: /take snapshot/i }));

    await waitFor(() => {
      expect(screen.getByText(/Example Domain/)).toBeInTheDocument();
    });
  });

  it('handles MCP error response', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Navigation failed' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.type(screen.getByPlaceholderText(/url/i), 'https://bad-url');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(screen.getByText('Navigation failed')).toBeInTheDocument();
    });
  });

  it('handles error state on failed navigate', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));

    render(<PlaywrightPanel sdk={sdk} extensionName="playwright-mcp" />);

    await user.type(screen.getByPlaceholderText(/url/i), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
});
