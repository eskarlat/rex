import { useState } from 'react';

interface PanelProps {
  sdk?: {
    exec: { run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }> };
    ui: { toast: (opts: { title: string; description?: string }) => void };
  };
  extensionName?: string;
}

export default function DevToolsPanel({ sdk }: Partial<PanelProps>) {
  const [output, setOutput] = useState('');
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const run = async (command: string, args?: Record<string, unknown>) => {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`renre-devtools:${command}`, args);
      setOutput(result.output);
    } catch (err) {
      setOutput(`Error: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '16px', fontFamily: 'system-ui' }}>
      <h2>Browser DevTools</h2>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button onClick={() => run('launch')} disabled={loading}>
          Launch
        </button>
        <button onClick={() => run('close')} disabled={loading}>
          Close
        </button>
        <button onClick={() => run('tabs')} disabled={loading}>
          Tabs
        </button>
        <button onClick={() => run('screenshot')} disabled={loading}>
          Screenshot
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <input
          type="text"
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1, padding: '4px 8px' }}
        />
        <button onClick={() => run('navigate', { url })} disabled={loading || !url}>
          Navigate
        </button>
      </div>

      <pre
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '16px',
          borderRadius: '8px',
          overflow: 'auto',
          maxHeight: '400px',
          fontSize: '13px',
          whiteSpace: 'pre-wrap',
        }}
      >
        {loading ? 'Loading...' : output || 'No output yet. Launch a browser to get started.'}
      </pre>
    </div>
  );
}
