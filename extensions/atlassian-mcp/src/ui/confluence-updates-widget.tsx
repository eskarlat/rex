import { useState, useEffect } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface ConfluenceResult {
  title: string;
  space?: { key: string };
  history?: {
    lastUpdated?: {
      by?: { displayName: string };
      when?: string;
    };
  };
}

export default function ConfluenceUpdatesWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const [pages, setPages] = useState<
    Array<{ title: string; space: string; modifier: string; time: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extName = extensionName ?? 'atlassian-mcp';

  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec
      .run(`${extName}:confluence_search`, {
        cql: 'lastModified >= now("-7d") ORDER BY lastModified DESC',
        limit: 10,
      })
      .then((result) => {
        const data = JSON.parse(result.output) as { results?: ConfluenceResult[] };
        const items = (data.results ?? []).map((r) => ({
          title: r.title,
          space: r.space?.key ?? '',
          modifier: r.history?.lastUpdated?.by?.displayName ?? 'Unknown',
          time: r.history?.lastUpdated?.when ?? '',
        }));
        setPages(items);
      })
      .catch(() => setError('Failed to load updates'))
      .finally(() => setLoading(false));
  }, [sdk, extName]);

  if (loading) {
    return <div className="p-3 text-xs text-muted-foreground">Loading updates...</div>;
  }

  if (error) {
    return <div className="p-3 text-xs text-red-500">{error}</div>;
  }

  return (
    <div className="max-h-full overflow-auto p-2">
      <p className="mb-2 text-xs font-semibold">Confluence Updates</p>
      {pages.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent updates.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {pages.map((page, i) => (
            <li key={`${page.title}-${i}`} className="border-b border-border py-1.5 text-xs">
              <div className="font-medium text-[#0052CC]">{page.title}</div>
              <div className="mt-0.5 flex justify-between text-[11px] text-muted-foreground">
                <span>{page.space}</span>
                <span>{page.modifier}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
