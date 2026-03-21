import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { FormField } from './FormField';

describe('FormField', () => {
  it('renders label and children', () => {
    render(
      <FormField label="Username">
        <input type="text" />
      </FormField>,
    );
    expect(screen.getByText('Username')).toBeInTheDocument();
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('renders error message when provided', () => {
    render(
      <FormField label="Email" error="Email is required">
        <input type="email" />
      </FormField>,
    );
    expect(screen.getByText('Email is required')).toBeInTheDocument();
  });

  it('does not render error when not provided', () => {
    render(
      <FormField label="Name">
        <input type="text" />
      </FormField>,
    );
    expect(screen.queryByText('Email is required')).not.toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <FormField label="Field" className="custom-field">
        <input />
      </FormField>,
    );
    expect(container.firstChild).toHaveClass('custom-field');
  });
});
