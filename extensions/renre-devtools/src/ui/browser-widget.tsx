import { useState, useEffect } from 'react';

interface PanelProps {
  sdk?: {
    exec: { run: (command: string, args?: Record<string, unknown>) => Promise<{ output: string }> };
  };
  extensionName?: string;
}

export default function BrowserStatusWidget({ sdk }: Partial<PanelProps>) {
  const [status, setStatus] = useState('Unknown');

  useEffect(() => {
    if (!sdk) return;
    sdk.exec
      .run('renre-devtools:tabs')
      .then((result) => {
        setStatus(result.output.includes('Open Tabs') ? 'Running' : 'Stopped');
      })
      .catch(() => {
        setStatus('Stopped');
      });
  }, [sdk]);

  return (
    <div style={{ padding: '12px', fontFamily: 'system-ui' }}>
      <div style={{ fontSize: '14px', fontWeight: 600 }}>Browser Status</div>
      <div
        style={{
          marginTop: '8px',
          fontSize: '24px',
          fontWeight: 700,
          color: status === 'Running' ? '#22c55e' : '#94a3b8',
        }}
      >
        {status}
      </div>
    </div>
  );
}
