import { useState } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
import type { PanelProps } from '@renre-kit/extension-sdk';

function extractMcpText(raw: string): { text: string; isError: boolean } {
  try {
    const parsed = JSON.parse(raw) as {
      content?: { text?: string }[];
      isError?: boolean;
    };
    const text = parsed.content?.[0]?.text ?? raw;
    return { text, isError: !!parsed.isError };
  } catch {
    return { text: raw, isError: false };
  }
}

export default function PlaywrightPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'playwright-mcp';

  const [url, setUrl] = useState('');
  const [snapshot, setSnapshot] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleNavigate() {
    if (!sdk || !url.trim()) return;
    setLoading(true);
    setError(null);
    setSnapshot(null);
    try {
      const result = await sdk.exec.run(`${extName}:browser_navigate`, { url: url.trim() });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setSnapshot(text);
    } catch {
      setError('Failed to navigate. Check the URL and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSnapshot() {
    if (!sdk) return;
    setLoading(true);
    setError(null);
    try {
      const result = await sdk.exec.run(`${extName}:browser_snapshot`);
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setSnapshot(text);
    } catch {
      setError('Failed to take snapshot.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Playwright"
        description="Browser automation and testing via Playwright MCP server."
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          MCP stdio transport
        </div>
      </Panel>

      <Panel title="Navigate">
        <div className="flex flex-col gap-3">
          <FormField label="URL">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter URL (e.g. https://example.com)"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleNavigate();
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                onClick={() => void handleNavigate()}
                disabled={loading || !sdk || !url.trim()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Loading...' : 'Go'}
              </button>
            </div>
          </FormField>
        </div>
      </Panel>

      <Panel title="Actions">
        <div className="flex gap-2">
          <button
            onClick={() => void handleSnapshot()}
            disabled={loading || !sdk}
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            Take Snapshot
          </button>
        </div>
      </Panel>

      {snapshot && (
        <Panel title="Result">
          <CodeBlock code={snapshot} />
        </Panel>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
