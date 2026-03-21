import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ExtensionDetailPanel } from './ExtensionDetailPanel';
import type { Extension } from '@/core/hooks/use-extensions';

const mockChangelogData = { data: null as string | null, isLoading: false };
const mockReadmeData = { data: null as string | null, isLoading: false };

vi.mock('@/core/hooks/use-extensions', () => ({
  useInstallExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useActivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useDeactivateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useRemoveExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useUpdateExtension: () => ({ mutate: vi.fn(), isPending: false }),
  useExtensionChangelog: () => mockChangelogData,
  useExtensionReadme: () => mockReadmeData,
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

describe('ExtensionDetailPanel', () => {
  const fullExtension: Extension = {
    name: 'test-ext',
    version: '1.0.0',
    type: 'standard',
    description: 'A test extension',
    status: 'active',
    author: 'Jane Doe',
    tags: ['example', 'utility'],
    registrySource: 'default',
    installPath: '/home/.renre-kit/extensions/test-ext@1.0.0',
    installedAt: '2025-01-15T10:00:00Z',
    hasIcon: false,
  };

  it('shows empty state when no extension is selected', () => {
    renderWithProviders(<ExtensionDetailPanel extension={undefined} />);
    expect(screen.getByText('Select an extension to view details.')).toBeInTheDocument();
    expect(screen.getByTestId('detail-empty')).toBeInTheDocument();
  });

  it('renders extension name, version badge, and type badge', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
    // Version appears both in badge and metadata row
    expect(screen.getAllByText('1.0.0')).toHaveLength(2);
    // Type appears both in badge and metadata row
    expect(screen.getAllByText('standard')).toHaveLength(2);
  });

  it('renders description', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByText('A test extension')).toBeInTheDocument();
  });

  it('shows "No description available." when description is missing', () => {
    const noDesc: Extension = {
      name: 'test-ext',
      version: '1.0.0',
      type: 'standard',
      status: 'active',
    };
    renderWithProviders(<ExtensionDetailPanel extension={noDesc} />);
    expect(screen.getByText('No description available.')).toBeInTheDocument();
  });

  it('renders metadata fields: author, registry, path, date', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    expect(screen.getByText('default')).toBeInTheDocument();
    expect(screen.getByText('/home/.renre-kit/extensions/test-ext@1.0.0')).toBeInTheDocument();
    expect(screen.getByText('2025-01-15T10:00:00Z')).toBeInTheDocument();
  });

  it('renders tags', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByText('example')).toBeInTheDocument();
    expect(screen.getByText('utility')).toBeInTheDocument();
  });

  it('does not render tags section when tags are empty', () => {
    renderWithProviders(<ExtensionDetailPanel extension={{ ...fullExtension, tags: [] }} />);
    expect(screen.queryByText('Tags')).not.toBeInTheDocument();
  });

  it('renders action buttons for the extension', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByRole('button', { name: 'Deactivate' })).toBeInTheDocument();
  });

  it('renders update badge when update is available', () => {
    renderWithProviders(
      <ExtensionDetailPanel
        extension={{
          ...fullExtension,
          updateAvailable: '2.0.0',
          engineCompatible: true,
        }}
      />,
    );
    expect(screen.getByText('2.0.0 available')).toBeInTheDocument();
  });

  it('renders detail-panel test id when extension is provided', () => {
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByTestId('detail-panel')).toBeInTheDocument();
  });

  it('renders icon image when hasIcon is true', () => {
    renderWithProviders(
      <ExtensionDetailPanel
        extension={{ ...fullExtension, hasIcon: true }}
      />,
    );
    const img = screen.getByAltText('test-ext icon');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/api/extensions/test-ext/icon');
  });

  it('renders repository link when gitUrl is provided', () => {
    renderWithProviders(
      <ExtensionDetailPanel
        extension={{ ...fullExtension, gitUrl: 'https://github.com/user/repo.git' }}
      />,
    );
    const link = screen.getByRole('link', { name: /github\.com\/user\/repo/i });
    expect(link).toHaveAttribute('href', 'https://github.com/user/repo.git');
    expect(link).toHaveAttribute('target', '_blank');
  });

  it('omits optional metadata rows when values are missing', () => {
    const minimal: Extension = {
      name: 'minimal-ext',
      version: '0.1.0',
      type: 'standard',
      status: 'available',
    };
    renderWithProviders(<ExtensionDetailPanel extension={minimal} />);
    expect(screen.queryByText('Author')).not.toBeInTheDocument();
    expect(screen.queryByText('Registry Source')).not.toBeInTheDocument();
    expect(screen.queryByText('Install Path')).not.toBeInTheDocument();
    expect(screen.queryByText('Installed Date')).not.toBeInTheDocument();
  });

  it('renders docs tabs with both README and Changelog when both exist', () => {
    mockReadmeData.data = '# README';
    mockReadmeData.isLoading = false;
    mockChangelogData.data = '# Changelog';
    mockChangelogData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByTestId('docs-tabs')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'README' })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Changelog' })).toBeInTheDocument();
  });

  it('hides docs tabs entirely when neither readme nor changelog exist', () => {
    mockReadmeData.data = null;
    mockReadmeData.isLoading = false;
    mockChangelogData.data = null;
    mockChangelogData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.queryByTestId('docs-tabs')).not.toBeInTheDocument();
  });

  it('shows only README tab when changelog is absent', () => {
    mockReadmeData.data = '# README content';
    mockReadmeData.isLoading = false;
    mockChangelogData.data = null;
    mockChangelogData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByRole('tab', { name: 'README' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Changelog' })).not.toBeInTheDocument();
  });

  it('shows only Changelog tab when readme is absent', async () => {
    mockReadmeData.data = null;
    mockReadmeData.isLoading = false;
    mockChangelogData.data = '## [1.0.0]';
    mockChangelogData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.queryByRole('tab', { name: 'README' })).not.toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Changelog' })).toBeInTheDocument();
    expect(screen.getByTestId('changelog-content')).toBeInTheDocument();
  });

  it('renders readme content in the default tab', () => {
    mockReadmeData.data = '# Hello World\n\nA simple extension.';
    mockReadmeData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByTestId('readme-content')).toBeInTheDocument();
  });

  it('shows loading state for readme', () => {
    mockReadmeData.data = null;
    mockReadmeData.isLoading = true;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);
    expect(screen.getByTestId('readme-loading')).toBeInTheDocument();
  });

  it('renders changelog content when Changelog tab is clicked', async () => {
    mockReadmeData.data = '# README';
    mockReadmeData.isLoading = false;
    mockChangelogData.data = '## [1.0.0]\n\n### Added\n\n- Feature one';
    mockChangelogData.isLoading = false;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Changelog' }));
    expect(screen.getByTestId('changelog-content')).toBeInTheDocument();
  });

  it('shows loading state for changelog', async () => {
    mockReadmeData.data = '# README';
    mockReadmeData.isLoading = false;
    mockChangelogData.data = null;
    mockChangelogData.isLoading = true;
    renderWithProviders(<ExtensionDetailPanel extension={fullExtension} />);

    await userEvent.click(screen.getByRole('tab', { name: 'Changelog' }));
    expect(screen.getByTestId('changelog-loading')).toBeInTheDocument();
  });
});
