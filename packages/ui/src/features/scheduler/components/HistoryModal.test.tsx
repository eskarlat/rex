import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HistoryModal } from './HistoryModal';
import type { TaskHistoryEntry } from '@/core/hooks/use-scheduler';

const mockHistoryData: TaskHistoryEntry[] = [
  {
    id: 1,
    task_id: 10,
    started_at: '2024-06-01T10:00:00Z',
    finished_at: '2024-06-01T10:00:05Z',
    duration_ms: 5000,
    status: 'success',
    output: 'Backup completed',
  },
  {
    id: 2,
    task_id: 10,
    started_at: '2024-06-02T10:00:00Z',
    finished_at: '2024-06-02T10:00:03Z',
    duration_ms: 3000,
    status: 'failure',
    error: 'Connection timeout',
  },
];

let currentMockData: TaskHistoryEntry[] = mockHistoryData;

vi.mock('@/core/hooks/use-scheduler', () => ({
  useTaskHistory: () => ({ data: currentMockData, isLoading: false }),
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

describe('HistoryModal', () => {
  beforeEach(() => {
    currentMockData = mockHistoryData;
  });

  it('shows task name in dialog title', () => {
    renderWithProviders(
      <HistoryModal taskId={10} taskName="Daily Backup" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText('Task History: Daily Backup')).toBeInTheDocument();
  });

  it('shows history entries when data provided', () => {
    renderWithProviders(
      <HistoryModal taskId={10} taskName="Daily Backup" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText('5000ms')).toBeInTheDocument();
    expect(screen.getByText('3000ms')).toBeInTheDocument();
  });

  it('shows "No execution history." when empty', () => {
    currentMockData = [];
    renderWithProviders(
      <HistoryModal taskId={10} taskName="Daily Backup" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText('No execution history.')).toBeInTheDocument();
  });

  it('shows success badge for success status', () => {
    renderWithProviders(
      <HistoryModal taskId={10} taskName="Daily Backup" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText('success')).toBeInTheDocument();
  });

  it('shows failure badge for failure status', () => {
    renderWithProviders(
      <HistoryModal taskId={10} taskName="Daily Backup" open={true} onOpenChange={vi.fn()} />,
    );
    expect(screen.getByText('failure')).toBeInTheDocument();
  });
});
