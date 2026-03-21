import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import BrowserDevtoolsPanel from './panel.js';

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

const SCREENSHOT_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'data:image/png;base64,iVBORw0KGgo=' }],
});

const EVAL_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'Hello World' }],
});

const CRASH_ERROR = Object.assign(new Error('MCP process exited unexpectedly with code 1\nfatal: browser OOM'), {
  body: { error: 'MCP process exited unexpectedly with code 1\nfatal: browser OOM', code: 'MCP_PROCESS_CRASHED' },
});

// Mount check succeeds → browser is already running (evaluate returns page info)
const CHROME_CHECK_RUNNING_RESPONSE = JSON.stringify({
  content: [
    { type: 'text', text: JSON.stringify({ url: 'about:blank', title: '' }) },
  ],
});

// Mount check returns error → Chrome installed but no browser running
const CHROME_CHECK_IDLE_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: 'No active page to evaluate' }],
  isError: true,
});

function createMockSdk(overrides: Record<string, unknown> = {}) {
  return {
    exec: {
      // First call is the Chrome/browser state check on mount — default: idle (no browser running)
      run: vi.fn().mockResolvedValueOnce({ output: CHROME_CHECK_IDLE_RESPONSE, exitCode: 0 }),
    },
    storage: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    },
    ui: {
      toast: vi.fn(),
    },
    terminal: {
      open: vi.fn(),
      close: vi.fn(),
      send: vi.fn(),
    },
    ...overrides,
  };
}

describe('BrowserDevtoolsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders header with title and description', () => {
    render(<BrowserDevtoolsPanel />);
    expect(screen.getByText('Browser Devtools')).toBeInTheDocument();
    expect(screen.getByText(/control a headed puppeteer browser/i)).toBeInTheDocument();
  });

  it('renders open browser button', () => {
    render(<BrowserDevtoolsPanel />);
    expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<BrowserDevtoolsPanel />);
    expect(screen.getByText('Browser Devtools')).toBeInTheDocument();
    expect(screen.getByText(/no browser running/i)).toBeInTheDocument();
  });

  it('shows empty state when browser is not running', () => {
    render(<BrowserDevtoolsPanel />);
    expect(screen.getByText(/no browser running/i)).toBeInTheDocument();
    expect(screen.getByText(/click.*open browser/i)).toBeInTheDocument();
  });

  it('shows browser stopped status indicator initially', () => {
    render(<BrowserDevtoolsPanel />);
    expect(screen.getByText('Browser stopped')).toBeInTheDocument();
  });

  it('starts browser and shows controls on Open Browser click', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_navigate', {
        url: 'about:blank',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Browser running')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /stop browser/i })).toBeInTheDocument();
    });
  });

  it('shows navigation bar after browser starts', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go/i })).toBeInTheDocument();
    });
  });

  it('navigates to a URL when Go is clicked', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_navigate', {
        url: 'https://example.com',
      });
    });
  });

  it('takes a screenshot when Screenshot button is clicked', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: SCREENSHOT_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /screenshot/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /screenshot/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith(
        'renre-devtools:puppeteer_screenshot',
        expect.objectContaining({ name: expect.stringContaining('capture-'), encoded: true }),
      );
    });

    await waitFor(() => {
      expect(screen.getByAltText('Browser screenshot')).toBeInTheDocument();
    });
  });

  it('fetches page info when Page Info button is clicked', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /page info/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /page info/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_evaluate', {
        script: 'JSON.stringify({ url: document.URL, title: document.title })',
      });
    });
  });

  it('evaluates JavaScript in the console', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: EVAL_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('document.title')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('document.title'), 'document.title');
    await user.click(screen.getByRole('button', { name: /run/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_evaluate', {
        script: 'document.title',
      });
    });
  });

  it('stops the browser and resets state', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop browser/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /stop browser/i }));

    await waitFor(() => {
      expect(screen.getByText('Browser stopped')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
      expect(screen.getByText(/no browser running/i)).toBeInTheDocument();
    });
  });

  it('shows toast on browser start', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(sdk.ui.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Browser started' }),
      );
    });
  });

  it('shows toast on browser stop', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop browser/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /stop browser/i }));

    await waitFor(() => {
      expect(sdk.ui.toast).toHaveBeenCalledWith(
        expect.objectContaining({ title: 'Browser stopped' }),
      );
    });
  });

  it('handles MCP error response', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Browser launch failed' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByText('Browser launch failed')).toBeInTheDocument();
    });
  });

  it('handles rejected promise from exec.run', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection refused'));

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByText(/connection refused/i)).toBeInTheDocument();
    });
  });

  it('auto-fetches page info after starting browser', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('renre-devtools:puppeteer_evaluate', {
        script: 'JSON.stringify({ url: document.URL, title: document.title })',
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });
  });

  it('auto-fetches page info after navigation', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText('https://example.com')).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText('https://example.com'), 'https://example.com');
    await user.click(screen.getByRole('button', { name: /go/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledTimes(5); // 1 mount check + 4 interactions
    });
  });

  it('shows page title in status area', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByText('Example Domain')).toBeInTheDocument();
    });
  });

  it('starts health check polling when running', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    // Wait for start + auto page-info (+ 1 mount check)
    await vi.advanceTimersByTimeAsync(0);
    expect(sdk.exec.run).toHaveBeenCalledTimes(3);

    // Advance 10s for health poll
    await vi.advanceTimersByTimeAsync(10_000);

    expect(sdk.exec.run).toHaveBeenCalledTimes(4);
  });

  it('detects crash from health check and shows crashed state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockRejectedValueOnce(new Error('MCP process crashed'));

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await vi.advanceTimersByTimeAsync(0);
    expect(sdk.exec.run).toHaveBeenCalledTimes(3);

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(screen.getAllByText(/browser crashed/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /restart browser/i })).toBeInTheDocument();
    });
  });

  it('shows crash details in error message', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(CRASH_ERROR);

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByText(/browser OOM/i)).toBeInTheDocument();
    });
  });

  it('restarts browser from crashed state', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 })
      .mockRejectedValueOnce(new Error('crashed'))
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await vi.advanceTimersByTimeAsync(0);
    expect(sdk.exec.run).toHaveBeenCalledTimes(3); // 1 mount + 2 interactions

    await vi.advanceTimersByTimeAsync(10_000);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /restart browser/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /restart browser/i }));

    await waitFor(() => {
      expect(screen.getByText('Browser running')).toBeInTheDocument();
    });
  });

  it('stops polling on manual stop', async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /open browser/i })).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /stop browser/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /stop browser/i }));

    const callCount = sdk.exec.run.mock.calls.length;
    await vi.advanceTimersByTimeAsync(20_000);

    // No additional calls after stop
    expect(sdk.exec.run).toHaveBeenCalledTimes(callCount);
  });
});
