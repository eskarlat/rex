import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Context7Panel from './panel.js';

const RESOLVE_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: [
        '- Title: React',
        '- Context7-compatible library ID: /reactjs/react.dev',
        '- Description: Official React docs',
        '----------',
        '- Title: React',
        '- Context7-compatible library ID: /facebook/react',
        '- Description: The library for web UIs',
      ].join('\n'),
    },
  ],
});

const DOCS_RESPONSE = JSON.stringify({
  content: [{ type: 'text', text: '# React Hooks\nuseMemo, useCallback' }],
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

describe('Context7Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and description', () => {
    render(<Context7Panel />);
    expect(screen.getByText('Context7')).toBeInTheDocument();
    expect(screen.getByText(/library documentation lookup/i)).toBeInTheDocument();
  });

  it('renders search input and button', () => {
    render(<Context7Panel />);
    expect(screen.getByPlaceholderText(/library name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<Context7Panel />);
    expect(screen.getByText('Context7')).toBeInTheDocument();
  });

  it('calls resolve-library-id on search submit', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('context7-mcp:resolve-library-id', {
        query: 'react',
        libraryName: 'react',
      });
    });
  });

  it('shows library list after successful resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getAllByText('/reactjs/react.dev').length).toBeGreaterThan(0);
      expect(screen.getAllByText('/facebook/react').length).toBeGreaterThan(0);
    });
  });

  it('allows selecting a library from the list', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('The library for web UIs')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The library for web UIs'));

    const libraryButtons = screen.getByText('The library for web UIs').closest('button');
    expect(libraryButtons).toHaveClass('border-primary');
  });

  it('calls query-docs with selected ID and query', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: DOCS_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/query/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/query/i), 'how to use hooks');
    await user.click(screen.getByRole('button', { name: /query docs/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('context7-mcp:query-docs', {
        libraryId: '/reactjs/react.dev',
        query: 'how to use hooks',
      });
    });
  });

  it('displays documentation after query', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: DOCS_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/query/i)).toBeInTheDocument();
    });

    await user.type(screen.getByPlaceholderText(/query/i), 'hooks overview');
    await user.click(screen.getByRole('button', { name: /query docs/i }));

    await waitFor(() => {
      expect(screen.getByText(/React Hooks/)).toBeInTheDocument();
    });
  });

  it('handles MCP error response', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Library not found' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'nonexistent');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Library not found')).toBeInTheDocument();
    });
  });

  it('handles error state on failed resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('saves search to history on successful resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: RESOLVE_RESPONSE, exitCode: 0 });

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(sdk.storage.set).toHaveBeenCalledWith(
        'search-history',
        expect.stringContaining('react'),
      );
    });
  });

  it('loads and renders search history from storage', async () => {
    const sdk = createMockSdk();
    const historyData = [
      { libraryName: 'express', libraryId: '/express/docs', timestamp: Date.now() },
      { libraryName: 'zod', libraryId: '/zod/docs', timestamp: Date.now() - 1000 },
    ];
    sdk.storage.get.mockResolvedValueOnce(JSON.stringify(historyData));

    render(<Context7Panel sdk={sdk} extensionName="context7-mcp" />);

    await waitFor(() => {
      expect(screen.getByText('express')).toBeInTheDocument();
      expect(screen.getByText('zod')).toBeInTheDocument();
    });
  });
});
