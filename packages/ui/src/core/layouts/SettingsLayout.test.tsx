import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsLayout } from './SettingsLayout';

function renderWithRouter() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <SettingsLayout />
    </MemoryRouter>
  );
}

describe('SettingsLayout', () => {
  it('renders Settings heading', () => {
    renderWithRouter();
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(
      screen.getByText('Manage your RenreKit configuration.')
    ).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    renderWithRouter();
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Registries')).toBeInTheDocument();
    expect(screen.getByText('Vault')).toBeInTheDocument();
  });

  it('links point to correct routes', () => {
    renderWithRouter();
    const generalLink = screen.getByText('General').closest('a');
    const registriesLink = screen.getByText('Registries').closest('a');
    const vaultLink = screen.getByText('Vault').closest('a');

    expect(generalLink).toHaveAttribute('href', '/settings');
    expect(registriesLink).toHaveAttribute('href', '/settings/registries');
    expect(vaultLink).toHaveAttribute('href', '/settings/vault');
  });
});
