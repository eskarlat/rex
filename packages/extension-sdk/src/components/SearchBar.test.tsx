import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SearchBar } from './SearchBar';

describe('SearchBar', () => {
  it('renders a search input', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toBeInTheDocument();
  });

  it('displays the current value', () => {
    render(<SearchBar value="test query" onChange={vi.fn()} />);
    expect(screen.getByRole('searchbox')).toHaveValue('test query');
  });

  it('calls onChange when input changes', () => {
    const handleChange = vi.fn();
    render(<SearchBar value="" onChange={handleChange} />);
    fireEvent.change(screen.getByRole('searchbox'), {
      target: { value: 'new value' },
    });
    expect(handleChange).toHaveBeenCalledWith('new value');
  });

  it('uses default placeholder', () => {
    render(<SearchBar value="" onChange={vi.fn()} />);
    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('uses custom placeholder', () => {
    render(
      <SearchBar value="" onChange={vi.fn()} placeholder="Find extensions..." />
    );
    expect(screen.getByPlaceholderText('Find extensions...')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <SearchBar value="" onChange={vi.fn()} className="custom-search" />
    );
    expect(container.firstChild).toHaveClass('custom-search');
  });
});
