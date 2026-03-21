import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExtensionListItem } from './ExtensionListItem';
import type { Extension } from '@/core/hooks/use-extensions';

describe('ExtensionListItem', () => {
  const baseExtension: Extension = {
    name: 'test-ext',
    version: '1.0.0',
    type: 'standard',
    description: 'A test extension',
    status: 'active',
  };

  it('renders extension name and version', () => {
    render(<ExtensionListItem extension={baseExtension} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
    expect(screen.getByText('1.0.0')).toBeInTheDocument();
  });

  it('renders author when provided', () => {
    render(
      <ExtensionListItem
        extension={{ ...baseExtension, author: 'Jane Doe' }}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByText('Jane Doe')).toBeInTheDocument();
  });

  it('does not render author when not provided', () => {
    render(<ExtensionListItem extension={baseExtension} isSelected={false} onSelect={vi.fn()} />);
    expect(screen.getByText('test-ext')).toBeInTheDocument();
  });

  it('renders default icon when hasIcon is false', () => {
    render(
      <ExtensionListItem
        extension={{ ...baseExtension, hasIcon: false }}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );
    expect(screen.getByTestId('default-icon')).toBeInTheDocument();
  });

  it('renders icon image when hasIcon is true', () => {
    render(
      <ExtensionListItem
        extension={{ ...baseExtension, hasIcon: true }}
        isSelected={false}
        onSelect={vi.fn()}
      />,
    );
    const img = screen.getByAltText('test-ext icon');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/api/extensions/test-ext/icon');
  });

  it('applies selected style when isSelected is true', () => {
    render(<ExtensionListItem extension={baseExtension} isSelected={true} onSelect={vi.fn()} />);
    const button = screen.getByTestId('ext-item-test-ext');
    expect(button.className).toContain('bg-accent');
  });

  it('calls onSelect with extension name on click', async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<ExtensionListItem extension={baseExtension} isSelected={false} onSelect={onSelect} />);
    await user.click(screen.getByTestId('ext-item-test-ext'));
    expect(onSelect).toHaveBeenCalledWith('test-ext');
  });
});
