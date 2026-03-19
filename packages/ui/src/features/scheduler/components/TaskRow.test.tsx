import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TaskRow } from './TaskRow';

const mockUpdateMutate = vi.fn();
const mockDeleteMutate = vi.fn();
const mockTriggerMutate = vi.fn();

vi.mock('@/core/hooks/use-scheduler', () => ({
  useUpdateTask: () => ({ mutate: mockUpdateMutate, isPending: false }),
  useDeleteTask: () => ({ mutate: mockDeleteMutate, isPending: false }),
  useTriggerTask: () => ({ mutate: mockTriggerMutate, isPending: false }),
  useTaskHistory: () => ({ data: [], isLoading: false }),
}));

function renderInTable(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <table>
          <tbody>{ui}</tbody>
        </table>
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

const baseTask = {
  id: '1',
  name: 'Daily Backup',
  type: 'backup-ext',
  project_path: null,
  command: 'backup:run',
  cron: '0 0 * * *',
  enabled: 1,
  last_run_at: null,
  last_status: null,
  next_run_at: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('TaskRow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows "No scheduled tasks." when task is undefined', () => {
    renderInTable(<TaskRow task={undefined} />);
    expect(screen.getByText('No scheduled tasks.')).toBeInTheDocument();
  });

  it('shows task name when task provided', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('Daily Backup')).toBeInTheDocument();
  });

  it('shows extension type badge', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('backup-ext')).toBeInTheDocument();
  });

  it('shows cron expression', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('0 0 * * *')).toBeInTheDocument();
  });

  it('shows enabled badge when enabled is true', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('Enabled')).toBeInTheDocument();
  });

  it('shows disabled badge when enabled is false', () => {
    renderInTable(<TaskRow task={{ ...baseTask, enabled: 0 }} />);
    expect(screen.getByText('Disabled')).toBeInTheDocument();
  });

  it('has Run Now, History, and Delete buttons', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('Run Now')).toBeInTheDocument();
    expect(screen.getByText('History')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('clicking Run Now calls triggerTask.mutate', async () => {
    renderInTable(<TaskRow task={baseTask} />);
    await userEvent.click(screen.getByText('Run Now'));
    expect(mockTriggerMutate).toHaveBeenCalledWith('1');
  });

  it('clicking Delete calls deleteTask.mutate', async () => {
    renderInTable(<TaskRow task={baseTask} />);
    await userEvent.click(screen.getByText('Delete'));
    expect(mockDeleteMutate).toHaveBeenCalledWith('1');
  });

  it('toggling switch calls updateTask.mutate with enabled value', async () => {
    renderInTable(<TaskRow task={baseTask} />);
    const toggle = screen.getByRole('switch', { name: 'Toggle task' });
    await userEvent.click(toggle);
    expect(mockUpdateMutate).toHaveBeenCalledWith({ id: '1', enabled: 0 });
  });

  it('shows "Never" when last_run is undefined', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('Never')).toBeInTheDocument();
  });

  it('shows "-" when next_run is undefined', () => {
    renderInTable(<TaskRow task={baseTask} />);
    expect(screen.getByText('-')).toBeInTheDocument();
  });

  it('shows formatted date when last_run_at is provided', () => {
    const task = { ...baseTask, last_run_at: '2026-01-15T10:30:00Z' };
    renderInTable(<TaskRow task={task} />);
    const formatted = new Date('2026-01-15T10:30:00Z').toLocaleString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
  });

  it('shows formatted date when next_run_at is provided', () => {
    const task = { ...baseTask, next_run_at: '2026-02-20T14:00:00Z' };
    renderInTable(<TaskRow task={task} />);
    const formatted = new Date('2026-02-20T14:00:00Z').toLocaleString();
    expect(screen.getByText(formatted)).toBeInTheDocument();
  });

  it('shows both formatted dates when last_run_at and next_run_at are provided', () => {
    const task = {
      ...baseTask,
      last_run_at: '2026-01-15T10:30:00Z',
      next_run_at: '2026-02-20T14:00:00Z',
    };
    renderInTable(<TaskRow task={task} />);
    const lastFormatted = new Date('2026-01-15T10:30:00Z').toLocaleString();
    const nextFormatted = new Date('2026-02-20T14:00:00Z').toLocaleString();
    expect(screen.getByText(lastFormatted)).toBeInTheDocument();
    expect(screen.getByText(nextFormatted)).toBeInTheDocument();
    expect(screen.queryByText('Never')).not.toBeInTheDocument();
    expect(screen.queryByText('-')).not.toBeInTheDocument();
  });

  it('clicking History opens history modal', async () => {
    renderInTable(<TaskRow task={baseTask} />);
    await userEvent.click(screen.getByText('History'));
    expect(screen.getByText('Task History: Daily Backup')).toBeInTheDocument();
  });
});
