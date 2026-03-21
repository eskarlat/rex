import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigForm } from './ConfigForm';
import type { ConfigField } from '@/core/hooks/use-settings';

vi.mock('@/core/hooks/use-vault', () => ({
  useVaultEntries: () => ({
    data: [
      { key: 'my.secret', created_at: '2026-01-01T00:00:00Z' },
      { key: 'other.key', created_at: '2026-02-01T00:00:00Z' },
    ],
  }),
}));

function renderForm(overrides: Partial<Parameters<typeof ConfigForm>[0]> = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const schema: Record<string, ConfigField> = {
    apiUrl: { type: 'string', description: 'The base URL for the API' },
    port: { type: 'number', description: 'Server port number' },
    enabled: { type: 'boolean', description: 'Enable or disable' },
    secretKey: {
      type: 'string',
      description: 'A secret value',
      secret: true,
      vaultHint: 'my.secret',
    },
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
      </QueryClientProvider>,
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
        expect.objectContaining({
          fieldName: 'apiUrl',
          mapping: { source: 'direct', value: 'https://api.example.com' },
        }),
      ]),
    );
  });

  it('renders vault icon buttons for string fields', () => {
    renderForm();
    const vaultButtons = screen.getAllByTitle(/vault/i);
    expect(vaultButtons.length).toBeGreaterThan(0);
  });

  it('renders empty schema message', () => {
    renderForm({ schema: {} });
    expect(screen.getByText('No configuration fields defined.')).toBeInTheDocument();
  });

  it('renders password input for secret fields', () => {
    renderForm();
    const secretInput = screen.getByLabelText(/secret key/i);
    expect(secretInput).toHaveAttribute('type', 'password');
  });

  it('renders vault placeholder hint', () => {
    renderForm();
    expect(screen.getByPlaceholderText('Vault hint: my.secret')).toBeInTheDocument();
  });

  it('shows Clear button when value is a vault reference', () => {
    renderForm({
      values: {
        apiUrl: 'https://api.example.com',
        port: 3000,
        enabled: true,
        secretKey: '{{VAULT:my.secret}}',
      },
    });
    expect(screen.getByText('Clear')).toBeInTheDocument();
  });

  it('vault reference field is readOnly with muted style', () => {
    renderForm({
      values: {
        apiUrl: 'https://api.example.com',
        port: 3000,
        enabled: true,
        secretKey: '{{VAULT:my.secret}}',
      },
    });
    const secretInput = screen.getByLabelText(/secret key/i);
    expect(secretInput).toHaveAttribute('readOnly');
    expect(secretInput).toHaveAttribute('type', 'text');
  });

  it('clicking vault icon opens vault picker dialog', async () => {
    renderForm();
    // Multiple vault buttons exist, get the one for secretKey (last string field)
    const vaultButtons = screen.getAllByTitle('Select from vault');
    await userEvent.click(vaultButtons[vaultButtons.length - 1]!);
    expect(screen.getByText('Select Vault Key')).toBeInTheDocument();
  });

  it('vault picker shows vault entries and suggested hint', async () => {
    renderForm();
    const vaultButtons = screen.getAllByTitle('Select from vault');
    await userEvent.click(vaultButtons[vaultButtons.length - 1]!);

    expect(screen.getByText(/Suggested:/)).toBeInTheDocument();
    // my.secret appears both as hint button and vault entry
    expect(screen.getAllByText('my.secret').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('other.key')).toBeInTheDocument();
  });

  it('clicking a vault entry sets the vault reference', async () => {
    const { onSave } = renderForm();
    const vaultButtons = screen.getAllByTitle('Select from vault');
    await userEvent.click(vaultButtons[vaultButtons.length - 1]!);

    // Click the suggested hint button within the "Suggested:" paragraph
    const suggestedParagraph = screen.getByText(/Suggested:/);
    const hintButton = within(suggestedParagraph).getByRole('button');
    await userEvent.click(hintButton);

    // Submit form to verify vault ref was set
    await userEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'secretKey',
          mapping: { source: 'vault', value: 'my.secret' },
        }),
      ]),
    );
  });

  it('boolean field renders switch and can be toggled', async () => {
    renderForm();
    const switchEl = screen.getByRole('switch');
    expect(switchEl).toBeInTheDocument();
    await userEvent.click(switchEl);
  });

  it('submits boolean false correctly', async () => {
    const { onSave } = renderForm({
      values: {
        apiUrl: 'https://api.example.com',
        port: 3000,
        enabled: false,
        secretKey: '',
      },
    });
    await userEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          fieldName: 'enabled',
          mapping: { source: 'direct', value: 'false' },
        }),
      ]),
    );
  });
});
