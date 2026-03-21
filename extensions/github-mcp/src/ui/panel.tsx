import { useState, useEffect } from 'react';
import { Panel, FormField } from '@renre-kit/extension-sdk/components';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface SearchEntry {
  query: string;
  timestamp: number;
}

interface Repository {
  name: string;
  description: string;
  stargazers_count: number;
}

interface Issue {
  number: number;
  title: string;
  state: string;
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

interface GitHubSearchResponse {
  items?: GitHubRepo[];
}

interface GitHubRepo {
  name?: string;
  full_name?: string;
  description?: string | null;
  stargazers_count?: number;
}

function normalizeRepo(repo: GitHubRepo): Repository {
  return {
    name: repo.full_name ?? repo.name ?? '',
    description: repo.description ?? '',
    stargazers_count: repo.stargazers_count ?? 0,
  };
}

function parseRepositories(text: string): Repository[] {
  try {
    const parsed = JSON.parse(text) as GitHubSearchResponse | GitHubRepo[];
    if (Array.isArray(parsed)) {
      return parsed.map(normalizeRepo);
    }
    return (parsed.items ?? []).map(normalizeRepo);
  } catch {
    return [];
  }
}

function parseIssues(text: string): Issue[] {
  try {
    return JSON.parse(text) as Issue[];
  } catch {
    return [];
  }
}

export default function GitHubPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'github-mcp';

  const [searchQuery, setSearchQuery] = useState('');
  const [repositories, setRepositories] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string | null>(null);
  const [issues, setIssues] = useState<Issue[]>([]);
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
    const updated = [entry, ...history.filter((h) => h.query !== entry.query)].slice(
      0,
      MAX_HISTORY,
    );
    setHistory(updated);
    await sdk.storage.set('search-history', JSON.stringify(updated));
  }

  async function handleSearch() {
    if (!sdk || !searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setRepositories([]);
    setSelectedRepo(null);
    setIssues([]);
    try {
      const result = await sdk.exec.run(`${extName}:search_repositories`, {
        query: searchQuery.trim(),
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      const parsed = parseRepositories(text);
      if (parsed.length === 0) {
        setError('No repositories found. Try a different query.');
        return;
      }
      setRepositories(parsed);
      setSelectedRepo(parsed[0]!.name);
      await saveToHistory({ query: searchQuery.trim(), timestamp: Date.now() });
    } catch {
      setError('Failed to search repositories. Check your token and try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleViewIssues() {
    if (!sdk || !selectedRepo) return;
    setLoading(true);
    setError(null);
    setIssues([]);
    try {
      const [owner, repo] = selectedRepo.split('/');
      const result = await sdk.exec.run(`${extName}:list_issues`, {
        owner: owner!,
        repo: repo!,
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) {
        setError(text);
        return;
      }
      setIssues(parseIssues(text));
    } catch {
      setError('Failed to fetch issues.');
    } finally {
      setLoading(false);
    }
  }

  function handleHistoryClick(entry: SearchEntry) {
    setSearchQuery(entry.query);
    setRepositories([]);
    setSelectedRepo(null);
    setIssues([]);
    setError(null);
  }

  return (
    <div className="flex flex-col gap-4">
      <Panel title="GitHub" description="GitHub integration via official MCP server.">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
          MCP stdio transport
        </div>
      </Panel>

      <Panel title="Search Repositories">
        <div className="flex flex-col gap-3">
          <FormField label="Repository">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search repository (e.g. react, next.js, express)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                {loading && repositories.length === 0 ? 'Searching...' : 'Search'}
              </button>
            </div>
          </FormField>
        </div>
      </Panel>

      {repositories.length > 0 && (
        <Panel title="Repositories">
          <div className="flex flex-col gap-2">
            {repositories.map((repo) => (
              <button
                key={repo.name}
                onClick={() => setSelectedRepo(repo.name)}
                className={`flex flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors ${
                  selectedRepo === repo.name
                    ? 'border-primary bg-primary/5'
                    : 'border-input hover:bg-accent'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{repo.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {repo.stargazers_count.toLocaleString()} stars
                  </span>
                </div>
                <span className="text-xs text-muted-foreground line-clamp-1">
                  {repo.description}
                </span>
              </button>
            ))}
          </div>
          {selectedRepo && (
            <div className="mt-3">
              <button
                onClick={() => void handleViewIssues()}
                disabled={loading}
                className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Loading...' : 'View Issues'}
              </button>
            </div>
          )}
        </Panel>
      )}

      {issues.length > 0 && (
        <Panel title={`Issues — ${selectedRepo ?? ''}`}>
          <div className="flex flex-col gap-1.5">
            {issues.map((issue) => (
              <div
                key={issue.number}
                className="flex items-center justify-between rounded-md border border-input p-2 text-sm"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-block h-2 w-2 rounded-full ${
                      issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'
                    }`}
                  />
                  <span>{issue.title}</span>
                </div>
                <code className="text-xs text-muted-foreground">#{issue.number}</code>
              </div>
            ))}
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
                key={entry.query}
                onClick={() => handleHistoryClick(entry)}
                className="flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left"
              >
                <span>{entry.query}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        </Panel>
      )}
    </div>
  );
}
