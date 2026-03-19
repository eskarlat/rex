import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GeneralPage } from './GeneralPage';

const mockMutate = vi.fn();
const mockSetTheme = vi.fn();
let mockSettings: {
  data:
    | {
        registries: unknown[];
        settings: { logLevels: string[] };
        extensionConfigs: Record<string, unknown>;
      }
    | undefined;
  isLoading: boolean;
};
let mockIsPending = false;

vi.mock('@/core/hooks/use-settings', () => ({
  useSettings: () => mockSettings,
  useUpdateSettings: () => ({ mutate: mockMutate, isPending: mockIsPending }),
}));

vi.mock('next-themes', () => ({
  useTheme: () => ({ setTheme: mockSetTheme, theme: 'light' }),
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
      data: {
        registries: [],
        settings: { logLevels: ['info', 'warn', 'error'] },
        extensionConfigs: {},
      },
      isLoading: false,
    };
  });

  it('renders Theme label', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('Theme')).toBeInTheDocument();
  });

  it('renders Log Level label', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('Log Level')).toBeInTheDocument();
  });

  it('does not render Port field', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.queryByLabelText('Port')).not.toBeInTheDocument();
  });

  it('renders log level checkboxes', () => {
    renderWithProviders(<GeneralPage />);
    expect(screen.getByText('debug')).toBeInTheDocument();
    expect(screen.getByText('info')).toBeInTheDocument();
    expect(screen.getByText('warn')).toBeInTheDocument();
    expect(screen.getByText('error')).toBeInTheDocument();
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
  });

  it('form submit saves logLevels without theme', async () => {
    const user = userEvent.setup();
    renderWithProviders(<GeneralPage />);

    await user.click(
      screen.getByRole('button', { name: 'Save Settings' })
    );

    expect(mockMutate).toHaveBeenCalledWith({
      registries: [],
      settings: { logLevels: ['info', 'warn', 'error'] },
      extensionConfigs: {},
    });
  });

  it('shows "Saving..." when isPending', () => {
    mockIsPending = true;
    renderWithProviders(<GeneralPage />);
    expect(
      screen.getByRole('button', { name: 'Saving...' })
    ).toBeInTheDocument();
  });
});
