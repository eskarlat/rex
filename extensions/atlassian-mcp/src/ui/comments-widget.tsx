import { useState, useEffect } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface CommentIssue {
  key: string;
  fields: {
    summary: string;
    comment?: {
      comments?: Array<{
        author: { displayName: string };
        body: unknown;
        updated: string;
      }>;
    };
  };
}

export default function CommentsWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const [items, setItems] = useState<Array<{ key: string; author: string; snippet: string; time: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extName = extensionName ?? 'atlassian-mcp';

  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec
      .run(`${extName}:jira_search`, {
        jql: 'issueFunction in commented("by currentUser()") ORDER BY updated DESC',
        maxResults: 10,
        fields: ['summary', 'comment'],
      })
      .then((result) => {
        const data = JSON.parse(result.output) as { issues?: CommentIssue[] };
        const flat = (data.issues ?? []).flatMap((issue) => {
          const comments = issue.fields.comment?.comments ?? [];
          const latest = comments[comments.length - 1];
          if (!latest) return [];
          return [{
            key: issue.key,
            author: latest.author.displayName,
            snippet: String(latest.body).slice(0, 80),
            time: latest.updated,
          }];
        });
        setItems(flat);
      })
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [sdk, extName]);

  if (loading) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>Loading comments...</div>;
  }

  if (error) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '8px', overflow: 'auto', maxHeight: '100%' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>Recent Comments</p>
      {items.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#6b7280' }}>No recent comments.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((item, i) => (
            <li
              key={`${item.key}-${i}`}
              style={{
                padding: '6px 0',
                borderBottom: '1px solid var(--border, #e5e7eb)',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500, color: '#0052CC' }}>{item.key}</span>
                <span style={{ color: '#6b7280', fontSize: '11px' }}>{item.author}</span>
              </div>
              <div style={{ color: '#374151', marginTop: '2px' }}>{item.snippet}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
