import { useState, useEffect } from 'react';

import type { PanelProps } from '../core/types.js';

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

export interface CommentsWidgetProps extends Partial<PanelProps> {
  defaultExtensionName?: string;
  searchCommand?: string;
}

export function CommentsWidget({
  sdk,
  extensionName,
  defaultExtensionName = '',
  searchCommand = 'jira_search',
}: Readonly<CommentsWidgetProps>) {
  const [items, setItems] = useState<
    Array<{ key: string; author: string; snippet: string; time: string }>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const extName = extensionName ?? defaultExtensionName;

  useEffect(() => {
    if (!sdk) return;
    setLoading(true);
    sdk.exec
      .run(`${extName}:${searchCommand}`, {
        jql: 'issueFunction in commented("by currentUser()") ORDER BY updated DESC',
        maxResults: 10,
        fields: ['summary', 'comment'],
        json: true,
      })
      .then((result) => {
        const data = JSON.parse(result.output) as { issues?: CommentIssue[] };
        const flat = (data.issues ?? []).flatMap((issue) => {
          const comments = issue.fields.comment?.comments ?? [];
          const latest = comments[comments.length - 1];
          if (!latest) return [];
          return [
            {
              key: issue.key,
              author: latest.author.displayName,
              snippet: String(latest.body).slice(0, 80),
              time: latest.updated,
            },
          ];
        });
        setItems(flat);
      })
      .catch(() => setError('Failed to load comments'))
      .finally(() => setLoading(false));
  }, [sdk, extName, searchCommand]);

  if (loading) {
    return <div className="p-3 text-xs text-muted-foreground">Loading comments...</div>;
  }

  if (error) {
    return <div className="p-3 text-xs text-red-500">{error}</div>;
  }

  return (
    <div className="max-h-full overflow-auto p-2">
      <p className="mb-2 text-xs font-semibold">Recent Comments</p>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">No recent comments.</p>
      ) : (
        <ul className="m-0 list-none p-0">
          {items.map((item, i) => (
            <li key={`${item.key}-${i}`} className="border-b border-border py-1.5 text-xs">
              <div className="flex justify-between">
                <span className="font-medium text-[#0052CC]">{item.key}</span>
                <span className="text-[11px] text-muted-foreground">{item.author}</span>
              </div>
              <div className="mt-0.5 text-foreground">{item.snippet}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
