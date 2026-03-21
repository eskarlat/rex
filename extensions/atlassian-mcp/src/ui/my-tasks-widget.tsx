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
    return <div className="p-3 text-xs text-muted-foreground">Loading tasks...</div>;
  }

  if (error) {
    return <div className="p-3 text-xs text-red-500">{error}</div>;
  }

  return (
    <div className="max-h-full overflow-auto p-2">
      <p className="mb-2 text-xs font-semibold">My Jira Tasks</p>
      {issues.length === 0 ? (
        <p className="text-xs text-muted-foreground">No assigned issues found.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {issues.map((issue) => (
            <li key={issue.key} className="border-b border-border py-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-medium text-[#0052CC]">{issue.key}</span>
                <span className="rounded bg-muted px-1.5 py-0.5 text-[11px]">
                  {issue.fields.status.name}
                </span>
              </div>
              <div className="mt-0.5 text-foreground">{issue.fields.summary}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
