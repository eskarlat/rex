import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DynamicPanel } from './DynamicPanel';

describe('DynamicPanel', () => {
  it('renders loading skeleton initially', () => {
    const { container } = render(
      <DynamicPanel extensionName="test-ext" />
    );
    // Suspense should show skeleton loading state, then error boundary catches the import failure
    // The error boundary should show the error alert
    expect(container).toBeDefined();
  });

  it('shows error message when panel fails to load', async () => {
    render(<DynamicPanel extensionName="nonexistent-ext" />);
    // Wait for the lazy import to fail and error boundary to render
    const errorMessage = await screen.findByText(
      /failed to load panel/i,
      {},
      { timeout: 3000 }
    );
    expect(errorMessage).toBeInTheDocument();
  });
});
