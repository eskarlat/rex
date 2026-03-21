import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FigmaPanel from './panel.js';

const GET_FILE_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: JSON.stringify(
        {
          name: 'My Design File',
          lastModified: '2024-01-15T10:30:00Z',
          version: '123456',
          document: { id: '0:0', name: 'Document', type: 'DOCUMENT' },
        },
        null,
        2,
      ),
    },
  ],
});

const GET_COMMENTS_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: JSON.stringify(
        {
          comments: [
            { id: '1', message: 'Looks great!', user: { handle: 'designer1' } },
            { id: '2', message: 'Needs more contrast', user: { handle: 'reviewer1' } },
          ],
        },
        null,
        2,
      ),
    },
  ],
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

describe('FigmaPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and description', () => {
    render(<FigmaPanel />);
    expect(screen.getByText('Figma')).toBeInTheDocument();
    expect(screen.getByText(/design file tools/i)).toBeInTheDocument();
  });

  it('renders file key input and button', () => {
    render(<FigmaPanel />);
    expect(screen.getByPlaceholderText(/file key/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get file/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<FigmaPanel />);
    expect(screen.getByText('Figma')).toBeInTheDocument();
  });

  it('shows MCP SSE transport indicator', () => {
    render(<FigmaPanel />);
    expect(screen.getByText(/MCP SSE transport/i)).toBeInTheDocument();
  });

  it('calls figma-mcp:get_file on file key submit', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: GET_FILE_RESPONSE, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('figma-mcp:get_file', {
        fileKey: 'abc123',
      });
    });
  });

  it('displays file info after successful fetch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: GET_FILE_RESPONSE, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/My Design File/).length).toBeGreaterThan(0);
    });
  });

  it('calls figma-mcp:get_comments for comments', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: GET_FILE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: GET_COMMENTS_RESPONSE, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /get comments/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /get comments/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('figma-mcp:get_comments', {
        fileKey: 'abc123',
      });
    });
  });

  it('displays comments after fetch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: GET_FILE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: GET_COMMENTS_RESPONSE, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /get comments/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /get comments/i }));

    await waitFor(() => {
      expect(screen.getByText(/Looks great!/)).toBeInTheDocument();
      expect(screen.getByText(/Needs more contrast/)).toBeInTheDocument();
    });
  });

  it('handles MCP error response', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'File not found' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'invalid');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(screen.getByText('File not found')).toBeInTheDocument();
    });
  });

  it('handles error state on failed fetch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('saves search to history on successful fetch', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: GET_FILE_RESPONSE, exitCode: 0 });

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await user.type(screen.getByPlaceholderText(/file key/i), 'abc123');
    await user.click(screen.getByRole('button', { name: /get file/i }));

    await waitFor(() => {
      expect(sdk.storage.set).toHaveBeenCalledWith(
        'file-history',
        expect.stringContaining('abc123'),
      );
    });
  });

  it('loads and renders file history from storage', async () => {
    const sdk = createMockSdk();
    const historyData = [
      { fileKey: 'abc123', fileName: 'My Design', timestamp: Date.now() },
      { fileKey: 'def456', fileName: 'Landing Page', timestamp: Date.now() - 1000 },
    ];
    sdk.storage.get.mockResolvedValueOnce(JSON.stringify(historyData));

    render(<FigmaPanel sdk={sdk} extensionName="figma-mcp" />);

    await waitFor(() => {
      expect(screen.getByText('abc123')).toBeInTheDocument();
      expect(screen.getByText('def456')).toBeInTheDocument();
    });
  });
});
