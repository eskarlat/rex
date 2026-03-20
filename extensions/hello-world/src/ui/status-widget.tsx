import { useState } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

export default function StatusWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? 'hello-world';

  async function handleQuickGreet() {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:greet`, {});
      setOutput(result.output);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: '8px' }}>
      <p style={{ fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
        {extName}
      </p>
      <button
        onClick={handleQuickGreet}
        disabled={loading || !sdk}
        style={{
          padding: '4px 12px',
          borderRadius: '4px',
          border: '1px solid #ccc',
          cursor: loading ? 'wait' : 'pointer',
          fontSize: '13px',
        }}
      >
        {loading ? 'Greeting...' : 'Quick Greet'}
      </button>
      {output && (
        <p style={{ fontSize: '13px', marginTop: '8px', color: '#666' }}>
          {output}
        </p>
      )}
    </div>
  );
}
