import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function CommentsWidget({ sdk, extensionName }) {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const extName = extensionName ?? 'atlassian-mcp';
    useEffect(() => {
        if (!sdk)
            return;
        setLoading(true);
        sdk.exec
            .run(`${extName}:jira_search`, {
            jql: 'issueFunction in commented("by currentUser()") ORDER BY updated DESC',
            maxResults: 10,
            fields: ['summary', 'comment'],
        })
            .then((result) => {
            const data = JSON.parse(result.output);
            const flat = (data.issues ?? []).flatMap((issue) => {
                const comments = issue.fields.comment?.comments ?? [];
                const latest = comments[comments.length - 1];
                if (!latest)
                    return [];
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
    }, [sdk, extName]);
    if (loading) {
        return _jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading comments..." });
    }
    if (error) {
        return _jsx("div", { className: "p-3 text-xs text-red-500", children: error });
    }
    return (_jsxs("div", { className: "max-h-full overflow-auto p-2", children: [_jsx("p", { className: "mb-2 text-xs font-semibold", children: "Recent Comments" }), items.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground", children: "No recent comments." })) : (_jsx("ul", { className: "m-0 list-none p-0", children: items.map((item, i) => (_jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [_jsxs("div", { className: "flex justify-between", children: [_jsx("span", { className: "font-medium text-[#0052CC]", children: item.key }), _jsx("span", { className: "text-[11px] text-muted-foreground", children: item.author })] }), _jsx("div", { className: "mt-0.5 text-foreground", children: item.snippet })] }, `${item.key}-${i}`))) }))] }));
}
