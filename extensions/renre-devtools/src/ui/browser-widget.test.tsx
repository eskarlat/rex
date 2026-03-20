import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowserWidget from './browser-widget.js';

const NAVIGATE_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'Navigated to about:blank' }],
});

const TITLE_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'Example Domain' }],
});

function createMockSdk() {
  return {
    exec: {
      run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
    },
  };
}

describe('BrowserWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders widget with Browser label', () => {
    render(<BrowserWidget extensionName="renre-devtools" />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
  });

  it('shows Stopped status initially', () => {
    render(<BrowserWidget />);
    expect(screen.getByText('Stopped')).toBeInTheDocument();
  });

  it('renders launch button', () => {
    render(<BrowserWidget />);
    expect(screen.getByRole('button', { name: /launch/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<BrowserWidget />);
    expect(screen.getByText('Browser')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /launch/i })).toBeDisabled();
  });

  it('launches browser on Launch click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_navigate', {
        url: 'about:blank',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Running')).toBeInTheDocument();
      expect(screen.getByText('New Tab')).toBeInTheDocument();
    });
  });

  it('shows Refresh button after browser is running', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });
  });

  it('refreshes page title on Refresh click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: TITLE_RESPONSE, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /refresh/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /refresh/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_evaluate', {
        script: 'document.title',
      });
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });
  });

  it('shows loading state while launching', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    let resolveRun!: (value: { output: string; exitCode: number }) => void;
    sdk.exec.run.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveRun = resolve;
      }),
    );

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    expect(screen.getByText(/starting/i)).toBeInTheDocument();

    resolveRun({ output: NAVIGATE_RESPONSE, exitCode: 0 });
    await waitFor(() => {
      expect(screen.queryByText(/starting/i)).not.toBeInTheDocument();
    });
  });

  it('handles error on launch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Failed' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('handles rejected promise on launch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection refused'));

    render(<BrowserWidget sdk={sdk} extensionName="renre-devtools" />);
    await user.click(screen.getByRole('button', { name: /launch/i }));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });
});
