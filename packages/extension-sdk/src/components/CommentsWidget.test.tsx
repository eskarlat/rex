import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CommentsWidget } from './CommentsWidget';

function createSdk(output: string) {
  return { exec: { run: vi.fn().mockResolvedValue({ output }) } };
}

describe('CommentsWidget', () => {
  it('renders heading without sdk', () => {
    render(<CommentsWidget defaultExtensionName="ext" />);
    expect(screen.getByText('Recent Comments')).toBeInTheDocument();
  });

  it('shows empty state after fetching returns no comments', async () => {
    const sdk = createSdk(JSON.stringify({ issues: [] }));
    render(<CommentsWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('No recent comments.')).toBeInTheDocument();
  });

  it('renders comment items', async () => {
    const issues = [
      {
        key: 'PROJ-1',
        fields: {
          summary: 'Test issue',
          comment: {
            comments: [{ author: { displayName: 'Alice' }, body: 'Looks good!', updated: '2026-01-01' }],
          },
        },
      },
    ];
    const sdk = createSdk(JSON.stringify({ issues }));
    render(<CommentsWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('PROJ-1')).toBeInTheDocument();
      expect(screen.getByText('Alice')).toBeInTheDocument();
      expect(screen.getByText('Looks good!')).toBeInTheDocument();
    });
  });

  it('skips issues with no comments', async () => {
    const issues = [{ key: 'PROJ-2', fields: { summary: 'No comments', comment: { comments: [] } } }];
    const sdk = createSdk(JSON.stringify({ issues }));
    render(<CommentsWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledTimes(1);
    });
    expect(screen.getByText('No recent comments.')).toBeInTheDocument();
  });

  it('shows error on fetch failure', async () => {
    const sdk = { exec: { run: vi.fn().mockRejectedValue(new Error('fail')) } };
    render(<CommentsWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load comments')).toBeInTheDocument();
    });
  });
});
