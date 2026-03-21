import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Modal } from './Modal';

describe('Modal', () => {
  it('renders title and children when open', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Test Modal">
        <p>Modal content</p>
      </Modal>,
    );
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    expect(screen.getByText('Modal content')).toBeInTheDocument();
  });

  it('renders optional description', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Title" description="A modal description">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.getByText('A modal description')).toBeInTheDocument();
  });

  it('does not render description when not provided', () => {
    render(
      <Modal open={true} onOpenChange={vi.fn()} title="Title">
        <p>Content</p>
      </Modal>,
    );
    expect(screen.queryByText('A modal description')).not.toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <Modal open={false} onOpenChange={vi.fn()} title="Hidden">
        <p>Hidden content</p>
      </Modal>,
    );
    expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
  });
});
