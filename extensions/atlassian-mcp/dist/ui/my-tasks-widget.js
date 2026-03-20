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
        return _jsx("div", { style: { padding: '12px', fontSize: '13px', color: '#6b7280' }, children: "Loading tasks..." });
    }
    if (error) {
        return _jsx("div", { style: { padding: '12px', fontSize: '13px', color: '#ef4444' }, children: error });
    }
    return (_jsxs("div", { style: { padding: '8px', overflow: 'auto', maxHeight: '100%' }, children: [_jsx("p", { style: { fontSize: '13px', fontWeight: 600, marginBottom: '8px' }, children: "My Jira Tasks" }), issues.length === 0 ? (_jsx("p", { style: { fontSize: '12px', color: '#6b7280' }, children: "No assigned issues found." })) : (_jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0 }, children: issues.map((issue) => (_jsxs("li", { style: {
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border, #e5e7eb)',
                        fontSize: '12px',
                    }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("span", { style: { fontWeight: 500, color: '#0052CC' }, children: issue.key }), _jsx("span", { style: {
                                        fontSize: '11px',
                                        padding: '1px 6px',
                                        borderRadius: '3px',
                                        background: 'var(--muted, #f3f4f6)',
                                    }, children: issue.fields.status.name })] }), _jsx("div", { style: { color: '#374151', marginTop: '2px' }, children: issue.fields.summary })] }, issue.key))) }))] }));
}
