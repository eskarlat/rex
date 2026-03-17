import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfigForm } from './ConfigForm';
import type { ConfigField } from '@/core/hooks/use-settings';

describe('ConfigForm', () => {
  const schema: Record<string, ConfigField> = {
    apiUrl: {
      type: 'string',
      label: 'API URL',
      description: 'The base URL for the API',
    },
    port: {
      type: 'number',
      label: 'Port',
      description: 'Server port number',
    },
    enabled: {
      type: 'boolean',
      label: 'Enabled',
      description: 'Enable or disable',
    },
    secretKey: {
      type: 'secret',
      label: 'Secret Key',
      description: 'A secret value',
    },
  };

  const values: Record<string, unknown> = {
    apiUrl: 'https://api.example.com',
    port: 3000,
    enabled: true,
    secretKey: '',
  };

  it('renders all fields from schema', () => {
    render(
      <ConfigForm
        schema={schema}
        values={values}
        onSave={vi.fn()}
        isSaving={false}
      />
    );
    expect(screen.getByText('API URL')).toBeInTheDocument();
    expect(screen.getByText('Port')).toBeInTheDocument();
    expect(screen.getByText('Enabled')).toBeInTheDocument();
    expect(screen.getByText('Secret Key')).toBeInTheDocument();
  });

  it('renders field descriptions', () => {
    render(
      <ConfigForm
        schema={schema}
        values={values}
        onSave={vi.fn()}
        isSaving={false}
      />
    );
    expect(
      screen.getByText('The base URL for the API')
    ).toBeInTheDocument();
  });

  it('shows Save button', () => {
    render(
      <ConfigForm
        schema={schema}
        values={values}
        onSave={vi.fn()}
        isSaving={false}
      />
    );
    expect(screen.getByText('Save')).toBeInTheDocument();
  });

  it('shows Saving... when isSaving is true', () => {
    render(
      <ConfigForm
        schema={schema}
        values={values}
        onSave={vi.fn()}
        isSaving={true}
      />
    );
    expect(screen.getByText('Saving...')).toBeInTheDocument();
  });

  it('calls onSave when form is submitted', async () => {
    const onSave = vi.fn();
    render(
      <ConfigForm
        schema={schema}
        values={values}
        onSave={onSave}
        isSaving={false}
      />
    );
    await userEvent.click(screen.getByText('Save'));
    expect(onSave).toHaveBeenCalled();
  });
});
