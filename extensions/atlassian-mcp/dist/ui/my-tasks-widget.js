import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function MyTasksWidget({ sdk, extensionName }) {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const extName = extensionName ?? 'atlassian-mcp';
    useEffect(() => {
        if (!sdk)
            return;
        setLoading(true);
        sdk.exec
            .run(`${extName}:jira_search`, {
            jql: 'assignee = currentUser() ORDER BY updated DESC',
            maxResults: 10,
        })
            .then((result) => {
            const data = JSON.parse(result.output);
            setIssues(data.issues ?? []);
        })
            .catch(() => setError('Failed to load tasks'))
            .finally(() => setLoading(false));
    }, [sdk, extName]);
    if (loading) {
        return _jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading tasks..." });
    }
    if (error) {
        return _jsx("div", { className: "p-3 text-xs text-red-500", children: error });
    }
    return (_jsxs("div", { className: "max-h-full overflow-auto p-2", children: [_jsx("p", { className: "mb-2 text-xs font-semibold", children: "My Jira Tasks" }), issues.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground", children: "No assigned issues found." })) : (_jsx("ul", { className: "m-0 list-none p-0", children: issues.map((issue) => (_jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-medium text-[#0052CC]", children: issue.key }), _jsx("span", { className: "rounded bg-muted px-1.5 py-0.5 text-[11px]", children: issue.fields.status.name })] }), _jsx("div", { className: "mt-0.5 text-foreground", children: issue.fields.summary })] }, issue.key))) }))] }));
}
