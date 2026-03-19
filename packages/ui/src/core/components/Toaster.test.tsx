import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toaster } from './Toaster';

const mockDismiss = vi.fn();
let mockToasts: Array<{
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
}> = [];

vi.mock('@/core/hooks/use-toast', () => ({
  useToast: () => ({ toasts: mockToasts, dismiss: mockDismiss }),
}));

beforeEach(() => {
  mockToasts = [];
  vi.clearAllMocks();
});

describe('Toaster', () => {
  it('renders nothing when no toasts', () => {
    const { container } = render(<Toaster />);
    expect(container.innerHTML).toBe('');
  });

  it('renders toast with title', () => {
    mockToasts = [{ id: '1', title: 'Hello' }];
    render(<Toaster />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('renders toast with description', () => {
    mockToasts = [{ id: '1', title: 'Error', description: 'Something went wrong' }];
    render(<Toaster />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });

  it('renders destructive variant with correct class', () => {
    mockToasts = [{ id: '1', title: 'Danger', variant: 'destructive' }];
    render(<Toaster />);
    const alert = screen.getByRole('alert');
    expect(alert.className).toContain('destructive');
  });

  it('dismiss button calls dismiss with toast id', async () => {
    mockToasts = [{ id: 'abc', title: 'Test' }];
    render(<Toaster />);
    await userEvent.click(screen.getByText('x'));
    expect(mockDismiss).toHaveBeenCalledWith('abc');
  });

  it('renders multiple toasts', () => {
    mockToasts = [
      { id: '1', title: 'First' },
      { id: '2', title: 'Second' },
    ];
    render(<Toaster />);
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });
});
