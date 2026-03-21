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
        return _jsx("div", { className: "p-3 text-xs text-muted-foreground", children: "Loading updates..." });
    }
    if (error) {
        return _jsx("div", { className: "p-3 text-xs text-red-500", children: error });
    }
    return (_jsxs("div", { className: "max-h-full overflow-auto p-2", children: [_jsx("p", { className: "mb-2 text-xs font-semibold", children: "Confluence Updates" }), pages.length === 0 ? (_jsx("p", { className: "text-xs text-muted-foreground", children: "No recent updates." })) : (_jsx("ul", { className: "m-0 list-none p-0", children: pages.map((page, i) => (_jsxs("li", { className: "border-b border-border py-1.5 text-xs", children: [_jsx("div", { className: "font-medium text-[#0052CC]", children: page.title }), _jsxs("div", { className: "mt-0.5 flex justify-between text-[11px] text-muted-foreground", children: [_jsx("span", { children: page.space }), _jsx("span", { children: page.modifier })] })] }, `${page.title}-${i}`))) }))] }));
}
