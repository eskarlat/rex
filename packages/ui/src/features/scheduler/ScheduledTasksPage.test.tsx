import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScheduledTasksPage } from './ScheduledTasksPage';

vi.mock('@/core/hooks/use-scheduler', () => ({
  useScheduledTasks: () => ({
    data: [
      {
        id: 1,
        name: 'Sync repos',
        extension_name: 'git-sync',
        command: 'sync',
        cron: '*/5 * * * *',
        enabled: true,
        last_run: '2024-01-01T12:00:00Z',
        next_run: '2024-01-01T12:05:00Z',
        created_at: '2024-01-01T00:00:00Z',
      },
    ],
    isLoading: false,
  }),
  useCreateTask: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateTask: () => ({ mutate: vi.fn(), isPending: false }),
  useDeleteTask: () => ({ mutate: vi.fn(), isPending: false }),
  useTriggerTask: () => ({ mutate: vi.fn(), isPending: false }),
  useTaskHistory: () => ({ data: [], isLoading: false }),
}));

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>{ui}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe('ScheduledTasksPage', () => {
  it('renders scheduler heading', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
  });

  it('shows task name', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Sync repos')).toBeInTheDocument();
  });

  it('shows cron expression', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('*/5 * * * *')).toBeInTheDocument();
  });

  it('has a Create Task button', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('shows Run Now button', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Run Now')).toBeInTheDocument();
  });
});
