import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ScheduledTasksPage } from './ScheduledTasksPage';

const mockCreateMutate = vi.fn((_data: unknown, options?: { onSuccess?: () => void }) => {
  options?.onSuccess?.();
});

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
  useCreateTask: () => ({ mutate: mockCreateMutate, isPending: false }),
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
    </QueryClientProvider>,
  );
}

describe('ScheduledTasksPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders scheduler heading', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Scheduler')).toBeInTheDocument();
  });

  it('renders description text', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(
      screen.getByText('Manage scheduled tasks and view execution history.'),
    ).toBeInTheDocument();
  });

  it('shows task name in the table', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Sync repos')).toBeInTheDocument();
  });

  it('shows extension name', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('git-sync')).toBeInTheDocument();
  });

  it('shows cron expression', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('*/5 * * * *')).toBeInTheDocument();
  });

  it('has a Create Task button', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Create Task')).toBeInTheDocument();
  });

  it('shows Run Now button from TaskRow', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Run Now')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    renderWithProviders(<ScheduledTasksPage />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Extension')).toBeInTheDocument();
    expect(screen.getByText('Cron')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();
    expect(screen.getByText('Last Run')).toBeInTheDocument();
    expect(screen.getByText('Next Run')).toBeInTheDocument();
    expect(screen.getByText('Actions')).toBeInTheDocument();
  });

  it('opens Create Task dialog when button is clicked', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    expect(screen.getByText('Create Scheduled Task')).toBeInTheDocument();
    expect(
      screen.getByText('Schedule a recurring extension command.'),
    ).toBeInTheDocument();
  });

  it('dialog contains all four input fields', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Extension')).toBeInTheDocument();
    expect(screen.getByLabelText('Command')).toBeInTheDocument();
    expect(screen.getByLabelText('Cron Expression')).toBeInTheDocument();
  });

  it('Create button in dialog is disabled when fields are empty', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();
  });

  it('Create button is disabled when only some fields are filled', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    await userEvent.type(screen.getByLabelText('Name'), 'My Task');
    await userEvent.type(screen.getByLabelText('Extension'), 'my-ext');
    // command and cron are still empty
    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeDisabled();
  });

  it('Create button is enabled when all fields are filled', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    await userEvent.type(screen.getByLabelText('Name'), 'My Task');
    await userEvent.type(screen.getByLabelText('Extension'), 'my-ext');
    await userEvent.type(screen.getByLabelText('Command'), 'run');
    await userEvent.type(screen.getByLabelText('Cron Expression'), '0 * * * *');
    const createButton = screen.getByRole('button', { name: 'Create' });
    expect(createButton).toBeEnabled();
  });

  it('submits the form with correct data when Create is clicked', async () => {
    renderWithProviders(<ScheduledTasksPage />);
    await userEvent.click(screen.getByText('Create Task'));
    await userEvent.type(screen.getByLabelText('Name'), 'Backup DB');
    await userEvent.type(screen.getByLabelText('Extension'), 'db-tools');
    await userEvent.type(screen.getByLabelText('Command'), 'backup');
    await userEvent.type(
      screen.getByLabelText('Cron Expression'),
      '0 2 * * *',
    );
    await userEvent.click(screen.getByRole('button', { name: 'Create' }));
    expect(mockCreateMutate).toHaveBeenCalledWith(
      {
        name: 'Backup DB',
        extension_name: 'db-tools',
        command: 'backup',
        cron: '0 2 * * *',
      },
      expect.anything(),
    );
  });
});

describe('ScheduledTasksPage loading state', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('shows skeleton when loading', async () => {
    vi.doMock('@/core/hooks/use-scheduler', () => ({
      useScheduledTasks: () => ({
        data: undefined,
        isLoading: true,
      }),
      useCreateTask: () => ({ mutate: vi.fn(), isPending: false }),
      useUpdateTask: () => ({ mutate: vi.fn(), isPending: false }),
      useDeleteTask: () => ({ mutate: vi.fn(), isPending: false }),
      useTriggerTask: () => ({ mutate: vi.fn(), isPending: false }),
      useTaskHistory: () => ({ data: [], isLoading: false }),
    }));

    const { ScheduledTasksPage: LoadingPage } = await import(
      './ScheduledTasksPage'
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoadingPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('Scheduler')).toBeInTheDocument();
    // Should not show table or Create Task button in loading state
    expect(screen.queryByText('Create Task')).not.toBeInTheDocument();
  });
});

describe('ScheduledTasksPage empty state', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.clearAllMocks();
  });

  it('shows empty state when no tasks exist', async () => {
    vi.doMock('@/core/hooks/use-scheduler', () => ({
      useScheduledTasks: () => ({
        data: [],
        isLoading: false,
      }),
      useCreateTask: () => ({ mutate: vi.fn(), isPending: false }),
      useUpdateTask: () => ({ mutate: vi.fn(), isPending: false }),
      useDeleteTask: () => ({ mutate: vi.fn(), isPending: false }),
      useTriggerTask: () => ({ mutate: vi.fn(), isPending: false }),
      useTaskHistory: () => ({ data: [], isLoading: false }),
    }));

    const { ScheduledTasksPage: EmptyPage } = await import(
      './ScheduledTasksPage'
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <EmptyPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(screen.getByText('No scheduled tasks.')).toBeInTheDocument();
  });
});
