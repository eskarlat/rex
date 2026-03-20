import { useState, useEffect } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface FileHistoryEntry {
  fileKey: string;
  fileName: string;
  timestamp: number;
}

const MAX_HISTORY = 10;

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

function extractFileName(text: string): string {
  try {
    const parsed = JSON.parse(text) as { name?: string };
    return parsed.name ?? 'Unknown';
  } catch {
    const nameMatch = /"name"\s*:\s*"([^"]+)"/.exec(text);
    return nameMatch?.[1] ?? 'Unknown';
  }
}

export default function FigmaPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'figma-mcp';

  const [fileKey, setFileKey] = useState('');
  const [fileData, setFileData] = useState<string | null>(null);
  const [comments, setComments] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<FileHistoryEntry[]>([]);

  useEffect(() => {
    if (!sdk) return;
    void sdk.storage.get('file-history').then((raw) => {
      if (raw) {
        setHistory(JSON.parse(raw) as FileHistoryEntry[]);
      }
    });
  }, [sdk]);

  async function saveToHistory(entry: FileHistoryEntry) {
    if (!sdk) return;
    const updated = [entry, ...history.filter((h) => h.fileKey !== entry.fileKey)].slice(
      0,
      MAX_HISTORY,
    );
    setHistory(updated);
    await sdk.storage.set('file-history', JSON.stringify(updated));
  }

  async function handleGetFile() {
    if (!sdk || !fileKey.trim()) return;
    setLoading(true);
    setError(null);
    setFileData(null);
    setComments(null);
    try {
      const result = await sdk.exec.run(`${extName}:get_file`, {
        fileKey: fileKey.trim(),
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setFileData(text);
      const fileName = extractFileName(text);
      await saveToHistory({ fileKey: fileKey.trim(), fileName, timestamp: Date.now() });
    } catch {
      setError('Failed to fetch file. Check the file key and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetComments() {
    if (!sdk || !fileKey.trim()) return;
    setLoading(true);
    setError(null);
    setComments(null);
    try {
      const result = await sdk.exec.run(`${extName}:get_comments`, {
        fileKey: fileKey.trim(),
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setComments(text);
    } catch {
      setError('Failed to fetch comments.');
    } finally {
      setLoading(false);
    }
  }

  function handleHistoryClick(entry: FileHistoryEntry) {
    setFileKey(entry.fileKey);
    setFileData(null);
    setComments(null);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel
        title="Figma"
        description="Figma design file tools via MCP server."
      >
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          MCP SSE transport
        </div>
      </Panel>

      <Panel title="File Browser">
        <div className="flex flex-col gap-3">
          <FormField label="File Key">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter Figma file key (e.g. abc123XYZ)"
                value={fileKey}
                onChange={(e) => setFileKey(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') void handleGetFile(); }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                onClick={() => void handleGetFile()}
                disabled={loading || !sdk}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading && !fileData ? 'Loading...' : 'Get File'}
              </button>
            </div>
          </FormField>
        </div>
      </Panel>

      {fileData && (
        <Panel title="File Info">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2">
              <button
                onClick={() => void handleGetComments()}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading && !comments ? 'Loading...' : 'Get Comments'}
              </button>
            </div>
            <CodeBlock code={fileData} />
          </div>
        </Panel>
      )}

      {comments && (
        <Panel title="Comments">
          <CodeBlock code={comments} />
        </Panel>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {history.length > 0 && (
        <Panel title="Recent Files">
          <div className="flex flex-col gap-1.5">
            {history.map((entry) => (
              <button
                key={entry.fileKey}
                onClick={() => handleHistoryClick(entry)}
                className="flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left"
              >
                <span>{entry.fileName}</span>
                <code className="text-xs text-muted-foreground">{entry.fileKey}</code>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
