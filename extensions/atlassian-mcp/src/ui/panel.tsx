import { useState } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

export default function AtlassianPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const extName = extensionName ?? 'atlassian-mcp';

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
    <div className="flex flex-col gap-4">
      <div className="rounded-lg border border-border p-6">
        <h2 className="mb-2 text-xl font-semibold">Atlassian MCP</h2>
        <p className="text-sm text-muted-foreground">
          Jira and Confluence integration — 72 tools across 21 toolsets.
        </p>
        <div className="mt-2 inline-flex items-center gap-1.5">
          <span className="inline-block h-2 w-2 rounded-full bg-[#0052CC]" />
          <span className="text-xs text-muted-foreground">MCP stdio transport</span>
        </div>
      </div>

      <div className="rounded-lg border border-border p-6">
        <h3 className="mb-3 text-base font-medium">Connection Status</h3>
        <button
          onClick={() => {
            handleCheckStatus().catch(() => {});
          }}
          disabled={loading}
          className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? 'Checking...' : 'Check Status'}
        </button>
        {status && (
          <pre className="mt-3 whitespace-pre-wrap rounded-md bg-muted p-3 font-mono text-[13px]">
            {status}
          </pre>
        )}
      </div>
    </div>
  );
}
