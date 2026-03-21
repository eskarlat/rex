import { useState, useEffect } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface SearchEntry {
  libraryName: string;
  libraryId: string;
  timestamp: number;
}

interface ResolvedLibrary {
  title: string;
  libraryId: string;
  description: string;
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

function parseLibraryList(text: string): ResolvedLibrary[] {
  const libraries: ResolvedLibrary[] = [];
  const blocks = text.split('----------');
  for (const block of blocks) {
    const idMatch = /Context7-compatible library ID:\s*(\S+)/.exec(block);
    const titleMatch = /Title:\s*(.+)/.exec(block);
    const descMatch = /Description:\s*(.+)/.exec(block);
    if (idMatch?.[1]) {
      libraries.push({
        title: titleMatch?.[1]?.trim() ?? '',
        libraryId: idMatch[1].trim(),
        description: descMatch?.[1]?.trim() ?? '',
      });
    }
  }
  return libraries;
}

export default function Context7Panel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'context7-mcp';

  const [libraryName, setLibraryName] = useState('');
  const [query, setQuery] = useState('');
  const [libraries, setLibraries] = useState<ResolvedLibrary[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [docs, setDocs] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<SearchEntry[]>([]);

  useEffect(() => {
    if (!sdk) return;
    void sdk.storage.get('search-history').then((raw) => {
      if (raw) {
        setHistory(JSON.parse(raw) as SearchEntry[]);
      }
    });
  }, [sdk]);

  async function saveToHistory(entry: SearchEntry) {
    if (!sdk) return;
    const updated = [entry, ...history.filter((h) => h.libraryName !== entry.libraryName)].slice(
      0,
      MAX_HISTORY,
    );
    setHistory(updated);
    await sdk.storage.set('search-history', JSON.stringify(updated));
  }

  async function handleSearch() {
    if (!sdk || !libraryName.trim()) return;
    setLoading(true);
    setError(null);
    setLibraries([]);
    setSelectedId(null);
    setDocs(null);
    try {
      const result = await sdk.exec.run(`${extName}:resolve-library-id`, {
        query: libraryName.trim(),
        libraryName: libraryName.trim(),
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      const parsed = parseLibraryList(text);
      if (parsed.length === 0) {
        setError('No libraries found. Try a different name.');
        return;
      }
      setLibraries(parsed);
      const firstId = parsed[0]!.libraryId;
      setSelectedId(firstId);
      await saveToHistory({
        libraryName: libraryName.trim(),
        libraryId: firstId,
        timestamp: Date.now(),
      });
    } catch {
      setError('Failed to resolve library. Check the name and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleGetDocs() {
    if (!sdk || !selectedId || !query.trim()) return;
    setLoading(true);
    setError(null);
    setDocs(null);
    try {
      const result = await sdk.exec.run(`${extName}:query-docs`, {
        libraryId: selectedId,
        query: query.trim(),
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setDocs(text);
    } catch {
      setError('Failed to fetch documentation.');
    } finally {
      setLoading(false);
    }
  }

  function handleHistoryClick(entry: SearchEntry) {
    setLibraryName(entry.libraryName);
    setSelectedId(entry.libraryId);
    setLibraries([]);
    setDocs(null);
    setQuery('');
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel title="Context7" description="Library documentation lookup via Context7 MCP server.">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          MCP stdio transport
        </div>
      </Panel>

      <Panel title="Search Library">
        <div className="flex flex-col gap-3">
          <FormField label="Library Name">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter library name (e.g. react, express, zod)"
                value={libraryName}
                onChange={(e) => setLibraryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleSearch();
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                onClick={() => void handleSearch()}
                disabled={loading || !sdk}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading && libraries.length === 0 ? 'Searching...' : 'Search'}
              </button>
            </div>
          </FormField>
        </div>
      </Panel>

      {libraries.length > 0 && (
        <Panel title="Select Library">
          <div className="flex flex-col gap-2">
            {libraries.map((lib) => (
              <button
                key={lib.libraryId}
                onClick={() => setSelectedId(lib.libraryId)}
                className={`flex flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors ${
                  selectedId === lib.libraryId
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{lib.title}</span>
                  <code className="text-xs text-muted-foreground">{lib.libraryId}</code>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {lib.description}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      )}

      {selectedId && (
        <Panel title="Query Documentation">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-muted-foreground">
              Library: <code className="rounded bg-muted px-1.5 py-0.5">{selectedId}</code>
            </p>
            <FormField label="Query">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter your query (e.g. how to use hooks)"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') void handleGetDocs();
                  }}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                <button
                  onClick={() => void handleGetDocs()}
                  disabled={loading || !query.trim()}
                  className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
                >
                  {loading ? 'Loading...' : 'Query Docs'}
                </button>
              </div>
            </FormField>
            {docs && <CodeBlock code={docs} />}
          </div>
        </Panel>
      )}

      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      {history.length > 0 && (
        <Panel title="Recent Searches">
          <div className="flex flex-col gap-1.5">
            {history.map((entry) => (
              <button
                key={entry.libraryName}
                onClick={() => handleHistoryClick(entry)}
                className="flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left"
              >
                <span>{entry.libraryName}</span>
                <code className="text-xs text-muted-foreground">{entry.libraryId}</code>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
