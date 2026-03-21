import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionPanelPage } from './ExtensionPanelPage';

const mockParams: Record<string, string | undefined> = { name: 'test-ext' };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return { ...actual, useParams: () => mockParams, useNavigate: () => vi.fn() };
});

vi.mock('./components/DynamicPanel', () => ({
  DynamicPanel: ({ extensionName, panelId }: { extensionName: string; panelId?: string }) => (
    <div data-testid="dynamic-panel" data-panel-id={panelId ?? ''}>
      {extensionName}
    </div>
  ),
}));

const mockMarketplace = vi.fn();
vi.mock('@/core/hooks/use-extensions', () => ({
  useMarketplace: () => mockMarketplace(),
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

describe('ExtensionPanelPage', () => {
  beforeEach(() => {
    mockParams.name = 'test-ext';
    delete mockParams.panelId;
    mockMarketplace.mockReturnValue({ data: undefined });
  });

  it('renders extension name heading when no marketplace data', () => {
    renderWithProviders(<ExtensionPanelPage />);
    expect(screen.getByRole('heading', { name: 'test-ext' })).toBeInTheDocument();
  });

  it('renders DynamicPanel with extension name', () => {
    renderWithProviders(<ExtensionPanelPage />);
    const panel = screen.getByTestId('dynamic-panel');
    expect(panel).toBeInTheDocument();
    expect(panel).toHaveTextContent('test-ext');
  });

  it('shows no extension message when name is missing', () => {
    delete mockParams.name;
    renderWithProviders(<ExtensionPanelPage />);
    expect(screen.getByText('No extension specified.')).toBeInTheDocument();
  });

  it('displays title from marketplace instead of name', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'test-ext',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            title: 'Test Extension',
            panels: [],
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<ExtensionPanelPage />);
    expect(screen.getByRole('heading', { name: 'Test Extension' })).toBeInTheDocument();
  });

  it('shows tabs when extension has multiple panels', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'test-ext',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            title: 'Test Extension',
            panels: [
              { id: 'main', title: 'Main Panel' },
              { id: 'settings', title: 'Settings' },
              { id: 'analytics', title: 'Analytics' },
            ],
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<ExtensionPanelPage />);
    expect(screen.getByText('Main Panel')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Analytics')).toBeInTheDocument();
  });

  it('does not show tabs when extension has a single panel', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'test-ext',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            panels: [{ id: 'main', title: 'Main Panel' }],
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<ExtensionPanelPage />);
    expect(screen.queryByText('Main Panel')).not.toBeInTheDocument();
  });

  it('passes panelId from route params to DynamicPanel', () => {
    mockParams.panelId = 'settings';
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'test-ext',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            panels: [
              { id: 'main', title: 'Main' },
              { id: 'settings', title: 'Settings' },
            ],
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<ExtensionPanelPage />);
    const panel = screen.getByTestId('dynamic-panel');
    expect(panel.getAttribute('data-panel-id')).toBe('settings');
  });

  it('defaults to first panel ID when no panelId in route', () => {
    mockMarketplace.mockReturnValue({
      data: {
        active: [
          {
            name: 'test-ext',
            version: '1.0.0',
            type: 'standard',
            status: 'active',
            panels: [
              { id: 'main', title: 'Main' },
              { id: 'settings', title: 'Settings' },
            ],
          },
        ],
        installed: [],
        available: [],
      },
    });
    renderWithProviders(<ExtensionPanelPage />);
    const panel = screen.getByTestId('dynamic-panel');
    expect(panel.getAttribute('data-panel-id')).toBe('main');
  });
});
