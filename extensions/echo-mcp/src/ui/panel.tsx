import { useState } from 'react';

interface PanelProps {
  sdk?: {
    exec: {
      run(command: string, args?: Record<string, unknown>): Promise<{ output: string; exitCode: number }>;
    };
  };
  extensionName?: string;
}

export default function EchoMcpPanel({ sdk, extensionName }: PanelProps) {
  const [message, setMessage] = useState('');
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const extName = extensionName ?? 'echo-mcp';

  async function handleEcho() {
    if (!sdk) {
      setResponse(JSON.stringify({ echo: message || '(empty)' }, null, 2));
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:echo`, { message });
      setResponse(result.output);
    } catch {
      setResponse('Failed to execute echo command.');
    } finally {
      setLoading(false);
    }
  }

  async function handlePing() {
    if (!sdk) {
      setResponse('pong');
      return;
    }
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:ping`);
      setResponse(result.output);
    } catch {
      setResponse('Failed to execute ping command.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ padding: '1.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          Echo MCP Extension
        </h2>
        <p style={{ color: 'var(--muted-foreground, #6b7280)', fontSize: '0.875rem' }}>
          An MCP extension that echoes back messages via JSON-RPC over stdio.
        </p>
        <div style={{ marginTop: '0.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
          <span
            style={{
              width: '0.5rem',
              height: '0.5rem',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'inline-block',
            }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--muted-foreground, #6b7280)' }}>
            MCP stdio transport
          </span>
        </div>
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.75rem' }}>
          Echo
        </h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Type a message to echo..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') void handleEcho(); }}
            style={{
              flex: 1,
              padding: '0.5rem 0.75rem',
              border: '1px solid var(--border, #e5e7eb)',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              background: 'transparent',
              color: 'inherit',
            }}
          />
          <button
            onClick={() => void handleEcho()}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '0.375rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              background: 'var(--primary, #2563eb)',
              color: 'var(--primary-foreground, #fff)',
              border: 'none',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1,
            }}
          >
            Echo
          </button>
        </div>
      </div>

      <div style={{ padding: '1.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.75rem' }}>
          Ping
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--muted-foreground, #6b7280)', marginBottom: '0.75rem' }}>
          Verify the MCP server connection is alive.
        </p>
        <button
          onClick={() => void handlePing()}
          disabled={loading}
          style={{
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            fontSize: '0.875rem',
            fontWeight: 500,
            background: 'transparent',
            color: 'inherit',
            border: '1px solid var(--border, #e5e7eb)',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.5 : 1,
          }}
        >
          {loading ? 'Pinging...' : 'Ping'}
        </button>
      </div>

      {response !== null && (
        <div style={{ padding: '1.5rem', border: '1px solid var(--border, #e5e7eb)', borderRadius: '0.5rem' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 500, marginBottom: '0.5rem' }}>
            Response
          </h3>
          <pre
            style={{
              padding: '0.75rem 1rem',
              background: 'var(--muted, #f3f4f6)',
              borderRadius: '0.375rem',
              fontSize: '0.8125rem',
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              margin: 0,
            }}
          >
            {response}
          </pre>
        </div>
      )}
    </div>
  );
}
