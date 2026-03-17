import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeneralPage } from './GeneralPage';

const mockMutate = vi.fn();
let mockSettings: {
  data: { port: number; theme: string; logLevel: string } | undefined;
  isLoading: boolean;
};
let mockIsPending = false;

vi.mock('@/core/hooks/use-settings', () => ({
  useSettings: () => mockSettings,
  useUpdateSettings: () => ({ mutate: mockMutate, isPending: mockIsPending }),
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

describe('GeneralPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsPending = false;
    mockSettings = {
      data: { port: 4200, theme: 'light', logLevel: 'info' },
      isLoading: false,
    };
  });

  it('renders port input with value', () => {
    renderWithProviders(<GeneralPage />);
    const portInput = screen.getByLabelText('Port');
    expect(portInput).toBeInTheDocument();
    expect(portInput).toHaveValue(4200);
  });

  it('renders Save Settings button', () => {
    renderWithProviders(<GeneralPage />);
    expect(
      screen.getByRole('button', { name: 'Save Settings' })
    ).toBeInTheDocument();
  });

  it('shows loading skeleton when isLoading', () => {
    mockSettings = {
      data: undefined,
      isLoading: true,
    };
    renderWithProviders(<GeneralPage />);
    expect(
      screen.queryByRole('button', { name: 'Save Settings' })
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Port')).not.toBeInTheDocument();
  });

  it('form submit calls updateSettings.mutate', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GeneralPage />);

    await user.click(
      screen.getByRole('button', { name: 'Save Settings' })
    );

    expect(mockMutate).toHaveBeenCalledWith({
      port: 4200,
      theme: 'light',
      logLevel: 'info',
    });
  });

  it('shows "Saving..." when isPending', () => {
    mockIsPending = true;
    renderWithProviders(<GeneralPage />);
    expect(
      screen.getByRole('button', { name: 'Saving...' })
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Save Settings' })
    ).not.toBeInTheDocument();
  });

  it('renders Theme label', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders Log Level label', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('Log Level')).toBeInTheDocument();
  });

  it('renders Port label', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('Port')).toBeInTheDocument();
  });
});
