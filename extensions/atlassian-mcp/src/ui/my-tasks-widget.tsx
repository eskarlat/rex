import { useState, useEffect } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface JiraIssue {
  key: string;
  fields: {
    summary: string;
    status: { name: string };
    priority: { name: string };
  };
}

export default function MyTasksWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const [issues, setIssues] = useState<JiraIssue[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extName = extensionName ?? 'atlassian-mcp';

  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec
      .run(`${extName}:jira_search`, {
        jql: 'assignee = currentUser() ORDER BY updated DESC',
        maxResults: 10,
      })
      .then((result) => {
        const data = JSON.parse(result.output) as { issues?: JiraIssue[] };
        setIssues(data.issues ?? []);
      })
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, [sdk, extName]);

  if (loading) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#6b7280' }}>Loading tasks...</div>;
  }

  if (error) {
    return <div style={{ padding: '12px', fontSize: '13px', color: '#ef4444' }}>{error}</div>;
  }

  return (
    <div style={{ padding: '8px', overflow: 'auto', maxHeight: '100%' }}>
      <p style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px' }}>My Jira Tasks</p>
      {issues.length === 0 ? (
        <p style={{ fontSize: '12px', color: '#6b7280' }}>No assigned issues found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {issues.map((issue) => (
            <li
              key={issue.key}
              style={{
                padding: '6px 0',
                borderBottom: '1px solid var(--border, #e5e7eb)',
                fontSize: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 500, color: '#0052CC' }}>{issue.key}</span>
                <span
                  style={{
                    fontSize: '11px',
                    padding: '1px 6px',
                    borderRadius: '3px',
                    background: 'var(--muted, #f3f4f6)',
                  }}
                >
                  {issue.fields.status.name}
                </span>
              </div>
              <div style={{ color: '#374151', marginTop: '2px' }}>{issue.fields.summary}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
