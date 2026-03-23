import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { StatusWidget } from './StatusWidget';

describe('StatusWidget', () => {
  it('renders extension name and check button', () => {
    render(<StatusWidget defaultExtensionName="my-ext" />);
    expect(screen.getByText('my-ext')).toBeInTheDocument();
    expect(screen.getByText('Check Status')).toBeInTheDocument();
  });

  it('disables button when sdk is not provided', () => {
    render(<StatusWidget defaultExtensionName="my-ext" />);
    expect(screen.getByText('Check Status')).toBeDisabled();
  });

  it('uses extensionName over defaultExtensionName', () => {
    render(<StatusWidget extensionName="override" defaultExtensionName="fallback" />);
    expect(screen.getByText('override')).toBeInTheDocument();
  });

  it('shows output after successful check', async () => {
    const sdk = { exec: { run: vi.fn().mockResolvedValue({ output: 'All systems go' }) } };
    render(<StatusWidget sdk={sdk as never} extensionName="ext" />);

    fireEvent.click(screen.getByText('Check Status'));

    await waitFor(() => {
      expect(screen.getByText('All systems go')).toBeInTheDocument();
    });
    expect(sdk.exec.run).toHaveBeenCalledWith('ext:status');
  });

  it('shows error message on failure', async () => {
    const sdk = { exec: { run: vi.fn().mockRejectedValue(new Error('fail')) } };
    render(<StatusWidget sdk={sdk as never} extensionName="ext" />);

    fireEvent.click(screen.getByText('Check Status'));

    await waitFor(() => {
      expect(screen.getByText('Failed to check status.')).toBeInTheDocument();
    });
  });
});
