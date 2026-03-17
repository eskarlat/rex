import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionPanelPage } from './ExtensionPanelPage';

const mockParams: Record<string, string> = { name: 'test-ext' };

vi.mock('react-router-dom', async () => {
  const actual =
    await vi.importActual<typeof import('react-router-dom')>(
      'react-router-dom'
    );
  return { ...actual, useParams: () => mockParams };
});

vi.mock('./components/DynamicPanel', () => ({
  DynamicPanel: ({ extensionName }: { extensionName: string }) => (
    <div data-testid="dynamic-panel">{extensionName}</div>
  ),
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

describe('ExtensionPanelPage', () => {
  it('renders extension name heading', () => {
    renderWithProviders(<ExtensionPanelPage />);
    expect(
      screen.getByRole('heading', { name: 'test-ext' })
    ).toBeInTheDocument();
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

    expect(
      screen.getByText('No extension specified.')
    ).toBeInTheDocument();

    // Restore
    mockParams.name = 'test-ext';
  });
});
