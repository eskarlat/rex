import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MyTasksWidget } from './MyTasksWidget';

function createSdk(output: string) {
  return { exec: { run: vi.fn().mockResolvedValue({ output }) } };
}

describe('MyTasksWidget', () => {
  it('renders heading without sdk', () => {
    render(<MyTasksWidget defaultExtensionName="ext" />);
    expect(screen.getByText('My Jira Tasks')).toBeInTheDocument();
  });

  it('shows empty state when no issues returned', async () => {
    const sdk = createSdk(JSON.stringify({ issues: [] }));
    render(<MyTasksWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('No assigned issues found.')).toBeInTheDocument();
    });
  });

  it('renders issues list', async () => {
    const issues = [
      { key: 'PROJ-1', fields: { summary: 'Fix bug', status: { name: 'Open' }, priority: { name: 'High' } } },
    ];
    const sdk = createSdk(JSON.stringify({ issues }));
    render(<MyTasksWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('PROJ-1')).toBeInTheDocument();
      expect(screen.getByText('Fix bug')).toBeInTheDocument();
      expect(screen.getByText('Open')).toBeInTheDocument();
    });
  });

  it('shows error on fetch failure', async () => {
    const sdk = { exec: { run: vi.fn().mockRejectedValue(new Error('fail')) } };
    render(<MyTasksWidget sdk={sdk as never} extensionName="ext" />);

    await waitFor(() => {
      expect(screen.getByText('Failed to load tasks')).toBeInTheDocument();
    });
  });
});
