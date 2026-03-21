import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionSidebar } from './ExtensionSidebar';
import type { MarketplaceFilter } from '../hooks/use-marketplace-filter';
import type { Extension } from '@/core/hooks/use-extensions';

function makeFilter(overrides: Partial<MarketplaceFilter> = {}): MarketplaceFilter {
  const active: Extension[] = overrides.filteredActive ?? [];
  const installed: Extension[] = overrides.filteredInstalled ?? [];
  const available: Extension[] = overrides.filteredAvailable ?? [];
  return {
    searchQuery: '',
    setSearchQuery: vi.fn(),
    selectedTag: null,
    setSelectedTag: vi.fn(),
    allTags: [],
    filteredActive: active,
    filteredInstalled: installed,
    filteredAvailable: available,
    allFiltered: [...active, ...installed, ...available],
    ...overrides,
  };
}

describe('ExtensionSidebar', () => {
  it('renders search input', () => {
    render(<ExtensionSidebar filter={makeFilter()} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search extensions...')).toBeInTheDocument();
  });

  it('renders Active section header with count', () => {
    const filter = makeFilter({
      filteredActive: [{ name: 'ext-a', version: '1.0.0', type: 'standard', status: 'active' }],
    });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('ext-a')).toBeInTheDocument();
  });

  it('renders Installed section header with count', () => {
    const filter = makeFilter({
      filteredInstalled: [
        { name: 'ext-b', version: '2.0.0', type: 'mcp-stdio', status: 'installed' },
      ],
    });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Installed')).toBeInTheDocument();
    expect(screen.getByText('ext-b')).toBeInTheDocument();
  });

  it('renders Available section header with count', () => {
    const filter = makeFilter({
      filteredAvailable: [
        { name: 'ext-c', version: '3.0.0', type: 'standard', status: 'available' },
      ],
    });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByText('Available')).toBeInTheDocument();
    expect(screen.getByText('ext-c')).toBeInTheDocument();
  });

  it('shows empty message when no extensions match', () => {
    render(<ExtensionSidebar filter={makeFilter()} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByText('No extensions found.')).toBeInTheDocument();
  });

  it('renders filter toggle button when tags exist', () => {
    const filter = makeFilter({ allTags: ['automation', 'tools'] });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.getByTestId('filter-toggle')).toBeInTheDocument();
  });

  it('hides filter toggle button when no tags exist', () => {
    render(<ExtensionSidebar filter={makeFilter()} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.queryByTestId('filter-toggle')).not.toBeInTheDocument();
  });

  it('hides tag chips by default', () => {
    const filter = makeFilter({ allTags: ['automation', 'tools'] });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    expect(screen.queryByTestId('tag-filter')).not.toBeInTheDocument();
  });

  it('shows tag chips after clicking filter toggle', async () => {
    const user = userEvent.setup();
    const filter = makeFilter({ allTags: ['automation', 'tools'] });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    await user.click(screen.getByTestId('filter-toggle'));
    expect(screen.getByTestId('tag-filter')).toBeInTheDocument();
    expect(screen.getByText('automation')).toBeInTheDocument();
    expect(screen.getByText('tools')).toBeInTheDocument();
  });

  it('hides tag chips when clicking filter toggle again', async () => {
    const user = userEvent.setup();
    const filter = makeFilter({ allTags: ['automation', 'tools'] });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />);
    await user.click(screen.getByTestId('filter-toggle'));
    expect(screen.getByTestId('tag-filter')).toBeInTheDocument();
    await user.click(screen.getByTestId('filter-toggle'));
    expect(screen.queryByTestId('tag-filter')).not.toBeInTheDocument();
  });

  it('calls setSearchQuery on input change', async () => {
    const setSearchQuery = vi.fn();
    const user = userEvent.setup();
    render(
      <ExtensionSidebar
        filter={makeFilter({ setSearchQuery })}
        selectedName={null}
        onSelect={vi.fn()}
      />,
    );
    await user.type(screen.getByPlaceholderText('Search extensions...'), 'test');
    expect(setSearchQuery).toHaveBeenCalled();
  });

  it('calls setSelectedTag when clicking a tag badge', async () => {
    const setSelectedTag = vi.fn();
    const user = userEvent.setup();
    const filter = makeFilter({ allTags: ['automation'], setSelectedTag });
    render(
      <ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />,
    );
    await user.click(screen.getByTestId('filter-toggle'));
    await user.click(screen.getByText('automation'));
    expect(setSelectedTag).toHaveBeenCalledWith('automation');
  });

  it('calls setSelectedTag with null when clicking already-selected tag', async () => {
    const setSelectedTag = vi.fn();
    const user = userEvent.setup();
    const filter = makeFilter({
      allTags: ['automation'],
      selectedTag: 'automation',
      setSelectedTag,
    });
    render(
      <ExtensionSidebar filter={filter} selectedName={null} onSelect={vi.fn()} />,
    );
    await user.click(screen.getByTestId('filter-toggle'));
    await user.click(screen.getByText('automation'));
    expect(setSelectedTag).toHaveBeenCalledWith(null);
  });

  it('calls onSelect when clicking an extension item', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    const filter = makeFilter({
      filteredActive: [{ name: 'ext-a', version: '1.0.0', type: 'standard', status: 'active' }],
    });
    render(<ExtensionSidebar filter={filter} selectedName={null} onSelect={onSelect} />);
    await user.click(screen.getByTestId('ext-item-ext-a'));
    expect(onSelect).toHaveBeenCalledWith('ext-a');
  });
});
