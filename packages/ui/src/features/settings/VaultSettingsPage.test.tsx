import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { VaultSettingsPage } from './VaultSettingsPage';

vi.mock('@/features/vault/VaultPage', () => ({
  VaultPage: () => <div data-testid="vault-page">VaultPage</div>,
}));

describe('VaultSettingsPage', () => {
  it('renders VaultPage', () => {
    render(<VaultSettingsPage />);
    expect(screen.getByTestId('vault-page')).toBeInTheDocument();
    expect(screen.getByText('VaultPage')).toBeInTheDocument();
  });
});
