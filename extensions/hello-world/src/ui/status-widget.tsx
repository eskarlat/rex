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
    <div className="p-2">
      <p className="mb-2 text-sm font-medium">{extName}</p>
      <button
        onClick={handleQuickGreet}
        disabled={loading || !sdk}
        className="inline-flex h-8 items-center rounded border border-border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? 'Greeting...' : 'Quick Greet'}
      </button>
      {output && <p className="mt-2 text-xs text-muted-foreground">{output}</p>}
    </div>
  );
}
