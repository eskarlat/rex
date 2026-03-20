import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
export default function ConfluenceUpdatesWidget({ sdk, extensionName }) {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const extName = extensionName ?? 'atlassian-mcp';
    useEffect(() => {
        if (!sdk)
            return;
        setLoading(true);
        sdk.exec
            .run(`${extName}:confluence_search`, {
            cql: 'lastModified >= now("-7d") ORDER BY lastModified DESC',
            limit: 10,
        })
            .then((result) => {
            const data = JSON.parse(result.output);
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
        return _jsx("div", { style: { padding: '12px', fontSize: '13px', color: '#6b7280' }, children: "Loading updates..." });
    }
    if (error) {
        return _jsx("div", { style: { padding: '12px', fontSize: '13px', color: '#ef4444' }, children: error });
    }
    return (_jsxs("div", { style: { padding: '8px', overflow: 'auto', maxHeight: '100%' }, children: [_jsx("p", { style: { fontSize: '13px', fontWeight: 600, marginBottom: '8px' }, children: "Confluence Updates" }), pages.length === 0 ? (_jsx("p", { style: { fontSize: '12px', color: '#6b7280' }, children: "No recent updates." })) : (_jsx("ul", { style: { listStyle: 'none', padding: 0, margin: 0 }, children: pages.map((page, i) => (_jsxs("li", { style: {
                        padding: '6px 0',
                        borderBottom: '1px solid var(--border, #e5e7eb)',
                        fontSize: '12px',
                    }, children: [_jsx("div", { style: { fontWeight: 500, color: '#0052CC' }, children: page.title }), _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginTop: '2px', color: '#6b7280', fontSize: '11px' }, children: [_jsx("span", { children: page.space }), _jsx("span", { children: page.modifier })] })] }, `${page.title}-${i}`))) }))] }));
}
