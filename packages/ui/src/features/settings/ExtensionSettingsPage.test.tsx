import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionSettingsPage } from './ExtensionSettingsPage';

const mockParams: Record<string, string> = { name: 'test-ext' };

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return { ...actual, useParams: () => mockParams };
});

vi.mock('@/core/hooks/use-settings', () => ({
  useExtensionSettings: () => ({
    data: {
      schema: { apiKey: { type: 'string', label: 'API Key' } },
      values: { apiKey: 'abc' },
    },
    isLoading: false,
  }),
  useUpdateExtensionSettings: () => ({ mutate: vi.fn(), isPending: false }),
}));

vi.mock('./components/ConfigForm', () => ({
  ConfigForm: () => <div data-testid="config-form">ConfigForm</div>,
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

describe('ExtensionSettingsPage', () => {
  it('renders extension name heading', () => {
    renderWithProviders(<ExtensionSettingsPage />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
  });

  it('renders ConfigForm', () => {
    renderWithProviders(<ExtensionSettingsPage />);
    expect(screen.getByTestId('config-form')).toBeInTheDocument();
  });

  it('shows no extension message when name is missing', () => {
    delete mockParams.name;

    renderWithProviders(<ExtensionSettingsPage />);

    expect(
      screen.getByText('No extension specified.')
    ).toBeInTheDocument();

    // Restore
    mockParams.name = 'test-ext';
  });
});

describe('ExtensionSettingsPage loading state', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('shows skeleton when loading', async () => {
    vi.doMock('react-router-dom', async () => {
      const actual =
        await vi.importActual<typeof import('react-router-dom')>(
          'react-router-dom'
        );
      return { ...actual, useParams: () => ({ name: 'test-ext' }) };
    });
    vi.doMock('@/core/hooks/use-settings', () => ({
      useExtensionSettings: () => ({
        data: undefined,
        isLoading: true,
      }),
      useUpdateExtensionSettings: () => ({ mutate: vi.fn(), isPending: false }),
    }));
    vi.doMock('./components/ConfigForm', () => ({
      ConfigForm: () => <div data-testid="config-form">ConfigForm</div>,
    }));

    const { ExtensionSettingsPage: LoadingPage } = await import(
      './ExtensionSettingsPage'
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <LoadingPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(screen.queryByTestId('config-form')).not.toBeInTheDocument();
  });

  it('shows no configuration message when config is null', async () => {
    vi.doMock('react-router-dom', async () => {
      const actual =
        await vi.importActual<typeof import('react-router-dom')>(
          'react-router-dom'
        );
      return { ...actual, useParams: () => ({ name: 'test-ext' }) };
    });
    vi.doMock('@/core/hooks/use-settings', () => ({
      useExtensionSettings: () => ({
        data: undefined,
        isLoading: false,
      }),
      useUpdateExtensionSettings: () => ({ mutate: vi.fn(), isPending: false }),
    }));
    vi.doMock('./components/ConfigForm', () => ({
      ConfigForm: () => <div data-testid="config-form">ConfigForm</div>,
    }));

    const { ExtensionSettingsPage: NoConfigPage } = await import(
      './ExtensionSettingsPage'
    );

    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <NoConfigPage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    expect(
      screen.getByText('No configuration available for this extension.')
    ).toBeInTheDocument();
  });
});
