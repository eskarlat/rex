import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import GitHubPanel from './panel.js';

const SEARCH_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: JSON.stringify({
        total_count: 2,
        incomplete_results: false,
        items: [
          {
            full_name: 'facebook/react',
            description: 'The library for web and native user interfaces.',
            stargazers_count: 220000,
          },
          {
            full_name: 'vercel/next.js',
            description: 'The React Framework',
            stargazers_count: 120000,
          },
        ],
      }),
    },
  ],
});

const ISSUES_RESPONSE = JSON.stringify({
  content: [
    {
      type: 'text',
      text: JSON.stringify([
        { number: 42, title: 'Fix rendering bug', state: 'open' },
        { number: 43, title: 'Add dark mode', state: 'open' },
      ]),
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

describe('GitHubPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders header with title and description', () => {
    render(<GitHubPanel />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
    expect(screen.getByText(/github integration/i)).toBeInTheDocument();
  });

  it('renders search input and button', () => {
    render(<GitHubPanel />);
    expect(screen.getByPlaceholderText(/repository/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });

  it('renders gracefully without SDK', () => {
    render(<GitHubPanel />);
    expect(screen.getByText('GitHub')).toBeInTheDocument();
  });

  it('calls search_repositories on search submit', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('github-mcp:search_repositories', {
        query: 'react',
      });
    });
  });

  it('shows repository list after successful search', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeInTheDocument();
      expect(screen.getByText('vercel/next.js')).toBeInTheDocument();
    });
  });

  it('allows selecting a repository from the list', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('The React Framework')).toBeInTheDocument();
    });

    await user.click(screen.getByText('The React Framework'));

    const repoButton = screen.getByText('The React Framework').closest('button');
    expect(repoButton).toHaveClass('border-primary');
  });

  it('calls list_issues for selected repository', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: ISSUES_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeInTheDocument();
    });

    await user.click(screen.getByText('facebook/react'));
    await user.click(screen.getByRole('button', { name: /view issues/i }));

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('github-mcp:list_issues', {
        owner: 'facebook',
        repo: 'react',
      });
    });
  });

  it('displays issues after fetching', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 })
      .mockResolvedValueOnce({ output: ISSUES_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('facebook/react')).toBeInTheDocument();
    });

    await user.click(screen.getByText('facebook/react'));
    await user.click(screen.getByRole('button', { name: /view issues/i }));

    await waitFor(() => {
      expect(screen.getByText('Fix rendering bug')).toBeInTheDocument();
      expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    });
  });

  it('handles MCP error response', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    const errorResponse = JSON.stringify({
      content: [{ type: 'text', text: 'Bad credentials' }],
      isError: true,
    });
    sdk.exec.run.mockResolvedValueOnce({ output: errorResponse, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText('Bad credentials')).toBeInTheDocument();
    });
  });

  it('handles error state on failed search', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });

  it('saves search to history on successful search', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: SEARCH_RESPONSE, exitCode: 0 });

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await user.type(screen.getByPlaceholderText(/repository/i), 'react');
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
      { query: 'react', timestamp: Date.now() },
      { query: 'typescript', timestamp: Date.now() - 1000 },
    ];
    sdk.storage.get.mockResolvedValueOnce(JSON.stringify(historyData));

    render(<GitHubPanel sdk={sdk} extensionName="github-mcp" />);

    await waitFor(() => {
      expect(screen.getByText('react')).toBeInTheDocument();
      expect(screen.getByText('typescript')).toBeInTheDocument();
    });
  });
});
