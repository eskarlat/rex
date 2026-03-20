import { describe, it, expect, vi, beforeEach } from 'vitest';
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

function createMockSdk(overrides: Record<string, unknown> = {}) {
  return {
    exec: {
      run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
    },
    storage: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    },
    ui: {
      toast: vi.fn(),
    },
    ...overrides,
  };
}

describe('BrowserDevtoolsPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
      .mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
      .mockResolvedValueOnce({ output: SCREENSHOT_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
      .mockResolvedValueOnce({ output: PAGE_INFO_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
      .mockResolvedValueOnce({ output: EVAL_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
    sdk.exec.run.mockResolvedValueOnce({ output: NAVIGATE_RESPONSE, exitCode: 0 });

    render(<BrowserDevtoolsPanel sdk={sdk} extensionName="renre-devtools" />);
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
    await user.click(screen.getByRole('button', { name: /open browser/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed to execute/i)).toBeInTheDocument();
    });
  });
});
