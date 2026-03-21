import { useState } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

export default function StatusWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'github-mcp';
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
    <div className="p-2">
      <div className="mb-2 flex items-center gap-1.5">
        <span className={`inline-block h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}`} />
        <span className="text-sm font-medium">{extName}</span>
      </div>
      <button
        onClick={() => void handleCheckStatus()}
        disabled={loading || !sdk}
        className="inline-flex h-8 items-center rounded border border-border bg-transparent px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Checking...' : 'Check Status'}
      </button>
      {output && (
        <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{output}</pre>
      )}
      {error && <p className="mt-2 text-xs text-red-500">{error}</p>}
    </div>
  );
}
