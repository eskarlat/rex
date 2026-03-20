import { useState } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

export default function MiroPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? 'miro-mcp';

  async function handleCheckStatus() {
    if (!sdk) {
      setStatus('SDK not available');
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:status`);
      setStatus(result.output);
    } catch {
      setStatus('Failed to check status.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div
        style={{
          padding: '1.5rem',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '0.5rem',
        }}
      >
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Miro MCP</h2>
        <p style={{ color: 'var(--muted-foreground, #6b7280)', fontSize: '0.875rem' }}>
          Miro integration — 98 tools across 21 toolsets.
        </p>
        <div
          style={{
            marginTop: '0.5rem',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: '#FFD02F',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground, #6b7280)' }}>
            MCP stdio transport
          </span>
        </div>
      </div>

      <div
        style={{
          padding: '1.5rem',
          border: '1px solid var(--border, #e5e7eb)',
          borderRadius: '0.5rem',
        }}
      >
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.75rem' }}>
          Connection Status
        </h3>
        <button
          onClick={() => {
            handleCheckStatus().catch(() => {});
          }}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: 'var(--primary, #FFD02F)',
            color: 'var(--primary-foreground, #050038)',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
        {status && (
          <pre
            style={{
              marginTop: '0.75rem',
              padding: '0.75rem 1rem',
              background: 'var(--muted, #f3f4f6)',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              margin: '0.75rem 0 0 0',
            }}
          >
            {status}
          </pre>
        )}
      </div>
    </div>
  );
}
