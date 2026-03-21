import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowserWidget from './browser-widget.js';

const NAVIGATE_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'Navigated to about:blank' }],
});

const PAGE_INFO_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: JSON.stringify({ url: 'https://example.com', title: 'Example Domain' }),
    },
  ],
});

const CHROME_NOT_FOUND_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: 'Could not find Chrome (ver. 131.0.6778.204). This can occur if either 1. you did not perform an installation before running the script (e.g. `npx puppeteer browsers install chrome`)',
    },
  ],
  isError: true,
});

function createMockSdk() {
  return {
    exec: {
      run: vi.fn().mockResolvedValue({ output: NAVIGATE_RESPONSE, exitCode: 0 }),
    },
    terminal: {
      open: vi.fn(),
      close: vi.fn(),
      send: vi.fn(),
    },
  };
}

describe('BrowserWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders widget with Browser label without SDK', () => {
    render(<BrowserWidget extensionName="renre-devtools" />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('shows Stopped status without SDK', () => {
    render(<BrowserWidget />);
    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });

  it('renders launch button disabled without SDK', () => {
    render(<BrowserWidget />);
    expect(screen.getByRole('button', { name: /launch/i })).toBeDisabled();
  });

  it('shows Checking status initially with SDK', () => {
    const sdk = createMockSdk();
    sdk.exec.run.mockReturnValueOnce(new Promise(() => {})); // never resolves
    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    expect(screen.getByText('Checking...')).toBeInTheDocument();
  });

  it('transitions to Running after successful mount check', async () => {
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });
  });

  it('shows no-chrome state when Chrome is missing', async () => {
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({
      output: CHROME_NOT_FOUND_RESPONSE,
      exitCode: 0,
    });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByText('Setup required')).toBeInTheDocument();
      expect(screen.getByText(/Chrome is not installed/)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /install chrome/i })).toBeInTheDocument();
    });
  });

  it('calls terminal.open and terminal.send on Install Chrome click', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({
      output: CHROME_NOT_FOUND_RESPONSE,
      exitCode: 0,
    });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /install chrome/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /install chrome/i }));

    expect(sdk.terminal.open).toHaveBeenCalled();
    expect(sdk.terminal.send).toHaveBeenCalledWith('npx puppeteer browsers install chrome\n');
  });

  it('shows Refresh button after browser is running', async () => {
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it('refreshes page title on Refresh click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 }) // mount check
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 }) // fetchPageInfo from mount
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 }); // refresh click

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });
  });

  it('handles error on launch after idle', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Failed' }],
      isError: true,
    });
    // Mount check fails with generic error → goes to idle
    sdk.exec.run
      .mockRejectedValueOnce(new Error('Connection refused'))
      // Manual launch also fails
      .mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /launch/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('detects crash from health check', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 }) // mount navigate
      .mockResolvedValue({ output: PAGE_INFO_RESPONSE, exitCode: 0 }); // fetchPageInfo default

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await vi.advanceTimersByTimeAsync(0);
    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
    });

    // Now set up the crash for the next health check
    sdk.exec.run.mockRejectedValueOnce(new Error('crashed'));
    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(screen.getByText('Crashed')).toBeInTheDocument();
    });
  });

  it('shows page title set by mount handler', async () => {
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('New Tab')).toBeInTheDocument();
    });
  });
});
