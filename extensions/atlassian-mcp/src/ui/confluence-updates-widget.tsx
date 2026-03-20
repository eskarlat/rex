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
  const [pages, setPages] = useState<Array<{ title: string; space: string; modifier: string; time: string }>>([]);
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
    return <div style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>Loading updates...</div>;
  }

  if (error) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '8px', overflow: 'auto', maxHeight: '100%' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Confluence Updates</p>
      {pages.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#6b7280' }}>No recent updates.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {pages.map((page, i) => (
            <li
              key={`${page.title}-${i}`}
              style={{
                padding: '6px 0',
                borderBottom: '1px solid var(--border, #e5e7eb)',
                fontSize: '12px',
              }}
            >
              <div style={{ fontWeight: 500, color: '#0052CC' }}>{page.title}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#6b7280', fontSize: '11px' }}>
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
