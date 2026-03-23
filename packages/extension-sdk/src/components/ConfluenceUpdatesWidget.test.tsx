import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { ConfluenceUpdatesWidget } from './ConfluenceUpdatesWidget';

function createSdk(output: string) {
  return { exec: { run: vi.fn().mockResolvedValue({ output }) } };
}

describe('ConfluenceUpdatesWidget', () => {
  it('renders heading without sdk', () => {
    render(<ConfluenceUpdatesWidget defaultExtensionName="ext" />);
    expect(screen.getByText('Confluence Updates')).toBeInTheDocument();
  });

  it('shows empty state after fetching returns no results', async () => {
    const sdk = createSdk(JSON.stringify({ results: [] }));
    render(<ConfluenceUpdatesWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('No recent updates.')).toBeInTheDocument();
  });

  it('renders page items with optional fields', async () => {
    const results = [
      {
        title: 'Architecture Doc',
        space: { key: 'ENG' },
        history: { lastUpdated: { by: { displayName: 'Bob' }, when: '2026-01-01' } },
      },
      { title: 'No Details Page' },
    ];
    const sdk = createSdk(JSON.stringify({ results }));
    render(<ConfluenceUpdatesWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('Architecture Doc')).toBeInTheDocument();
      expect(screen.getByText('ENG')).toBeInTheDocument();
      expect(screen.getByText('Bob')).toBeInTheDocument();
      expect(screen.getByText('No Details Page')).toBeInTheDocument();
      expect(screen.getByText('Unknown')).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    const sdk = { exec: { run: vi.fn().mockRejectedValue(new Error('fail')) } };
    render(<ConfluenceUpdatesWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load updates')).toBeInTheDocument();
    });
  });
});
