import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigForm } from './ConfigForm';
import type { ConfigField } from '@/core/hooks/use-settings';

vi.mock('@/core/hooks/use-vault', () => ({
  useVaultEntries: () => ({ data: [] }),
}));

function renderForm(overrides: Partial<Parameters<typeof ConfigForm>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const schema: Record<string, ConfigField> = {
    apiUrl: { type: 'string', description: 'The base URL for the API' },
    port: { type: 'number', description: 'Server port number' },
    enabled: { type: 'boolean', description: 'Enable or disable' },
    secretKey: { type: 'string', description: 'A secret value', secret: true, vaultHint: 'my.secret' },
  };
  const values: Record<string, unknown> = {
    apiUrl: 'https://api.example.com',
    port: 3000,
    enabled: true,
    secretKey: '',
  };
  const props = { schema, values, onSave: vi.fn(), isSaving: false, ...overrides };
  return {
    ...render(
      <QueryClientProvider client={queryClient}>
        <ConfigForm {...props} />
      </QueryClientProvider>
    ),
    onSave: props.onSave,
  };
}

describe('ConfigForm', () => {
  it('renders all fields from schema', () => {
    renderForm();
    expect(screen.getByText('The base URL for the API')).toBeInTheDocument();
    expect(screen.getByText('Server port number')).toBeInTheDocument();
    expect(screen.getByText('Enable or disable')).toBeInTheDocument();
    expect(screen.getByText('A secret value')).toBeInTheDocument();
  });

  it('shows Save button', () => {
    renderForm();
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows Saving... when isSaving is true', () => {
    renderForm({ isSaving: true });
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onSave with ConfigFormResult array when submitted', async () => {
    const { onSave } = renderForm();
    await userEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ fieldName: 'apiUrl', mapping: { source: 'direct', value: 'https://api.example.com' } }),
      ]),
    );
  });

  it('renders vault icon buttons for string fields', () => {
    renderForm();
    const vaultButtons = screen.getAllByTitle(/vault/i);
    expect(vaultButtons.length).toBeGreaterThan(0);
  });
});
