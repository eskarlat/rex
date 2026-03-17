import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Spinner } from './Spinner';

describe('Spinner', () => {
  it('renders an SVG element', () => {
    render(<Spinner />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses default md size (24px)', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveAttribute('width', '24');
    expect(svg).toHaveAttribute('height', '24');
  });

  it('renders sm size (16px)', () => {
    render(<Spinner size="sm" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveAttribute('width', '16');
    expect(svg).toHaveAttribute('height', '16');
  });

  it('renders lg size (32px)', () => {
    render(<Spinner size="lg" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveAttribute('width', '32');
    expect(svg).toHaveAttribute('height', '32');
  });

  it('applies custom className', () => {
    render(<Spinner className="custom-spinner" />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('custom-spinner');
  });

  it('has animate-spin class', () => {
    render(<Spinner />);
    const svg = screen.getByRole('status');
    expect(svg).toHaveClass('animate-spin');
  });
});
