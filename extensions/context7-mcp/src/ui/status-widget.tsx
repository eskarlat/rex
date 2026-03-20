import { useState } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

export default function StatusWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'context7-mcp';
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckStatus() {
    if (!sdk) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.exec.run(`${extName}:status`);
      setOutput(result.output);
    } catch {
      setError('Failed to check status.');
      setOutput(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '8px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: error ? '#ef4444' : '#22c55e',
            display: 'inline-block',
          }}
        />
        <span style={{ fontSize: '14px', fontWeight: 500 }}>{extName}</span>
      </div>
      <button
        onClick={() => void handleCheckStatus()}
        disabled={loading || !sdk}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: loading || !sdk ? 'not-allowed' : 'pointer',
          fontSize: '13px',
          background: 'transparent',
          color: 'inherit',
          opacity: loading || !sdk ? 0.5 : 1,
        }}
      >
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      {output && (
        <pre
          style={{
            fontSize: '12px',
            marginTop: '8px',
            color: 'var(--muted-foreground, #666)',
            whiteSpace: 'pre-wrap',
            margin: '8px 0 0',
          }}
        >
          {output}
        </pre>
      )}
      {error && (
        <p style={{ fontSize: '12px', marginTop: '8px', color: '#ef4444' }}>{error}</p>
      )}
    </div>
  );
}
