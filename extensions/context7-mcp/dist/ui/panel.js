import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
const MAX_HISTORY = 10;
function extractMcpText(raw) {
    try {
        const parsed = JSON.parse(raw);
        const text = parsed.content?.[0]?.text ?? raw;
        return { text, isError: !!parsed.isError };
    }
    catch {
        return { text: raw, isError: false };
    }
}
function parseLibraryList(text) {
    const libraries = [];
    const blocks = text.split('----------');
    for (const block of blocks) {
        const idMatch = /Context7-compatible library ID:\s*(\S+)/.exec(block);
        const titleMatch = /Title:\s*(.+)/.exec(block);
        const descMatch = /Description:\s*(.+)/.exec(block);
        if (idMatch?.[1]) {
            libraries.push({
                title: titleMatch?.[1]?.trim() ?? '',
                libraryId: idMatch[1].trim(),
                description: descMatch?.[1]?.trim() ?? '',
            });
        }
    }
    return libraries;
}
export default function Context7Panel({ sdk, extensionName }) {
    const extName = extensionName ?? 'context7-mcp';
    const [libraryName, setLibraryName] = useState('');
    const [query, setQuery] = useState('');
    const [libraries, setLibraries] = useState([]);
    const [selectedId, setSelectedId] = useState(null);
    const [docs, setDocs] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    useEffect(() => {
        if (!sdk)
            return;
        void sdk.storage.get('search-history').then((raw) => {
            if (raw) {
                setHistory(JSON.parse(raw));
            }
        });
    }, [sdk]);
    async function saveToHistory(entry) {
        if (!sdk)
            return;
        const updated = [entry, ...history.filter((h) => h.libraryName !== entry.libraryName)].slice(0, MAX_HISTORY);
        setHistory(updated);
        await sdk.storage.set('search-history', JSON.stringify(updated));
    }
    async function handleSearch() {
        if (!sdk || !libraryName.trim())
            return;
        setLoading(true);
        setError(null);
        setLibraries([]);
        setSelectedId(null);
        setDocs(null);
        try {
            const result = await sdk.exec.run(`${extName}:resolve-library-id`, {
                query: libraryName.trim(),
                libraryName: libraryName.trim(),
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            const parsed = parseLibraryList(text);
            if (parsed.length === 0) {
                setError('No libraries found. Try a different name.');
                return;
            }
            setLibraries(parsed);
            const firstId = parsed[0].libraryId;
            setSelectedId(firstId);
            await saveToHistory({
                libraryName: libraryName.trim(),
                libraryId: firstId,
                timestamp: Date.now(),
            });
        }
        catch {
            setError('Failed to resolve library. Check the name and try again.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGetDocs() {
        if (!sdk || !selectedId || !query.trim())
            return;
        setLoading(true);
        setError(null);
        setDocs(null);
        try {
            const result = await sdk.exec.run(`${extName}:query-docs`, {
                libraryId: selectedId,
                query: query.trim(),
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setDocs(text);
        }
        catch {
            setError('Failed to fetch documentation.');
        }
        finally {
            setLoading(false);
        }
    }
    function handleHistoryClick(entry) {
        setLibraryName(entry.libraryName);
        setSelectedId(entry.libraryId);
        setLibraries([]);
        setDocs(null);
        setQuery('');
        setError(null);
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Context7", description: "Library documentation lookup via Context7 MCP server.", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500" }), "MCP stdio transport"] }) }), _jsx(Panel, { title: "Search Library", children: _jsx("div", { className: "flex flex-col gap-3", children: _jsx(FormField, { label: "Library Name", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter library name (e.g. react, express, zod)", value: libraryName, onChange: (e) => setLibraryName(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter')
                                            void handleSearch();
                                    }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleSearch(), disabled: loading || !sdk, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading && libraries.length === 0 ? 'Searching...' : 'Search' })] }) }) }) }), libraries.length > 0 && (_jsx(Panel, { title: "Select Library", children: _jsx("div", { className: "flex flex-col gap-2", children: libraries.map((lib) => (_jsxs("button", { onClick: () => setSelectedId(lib.libraryId), className: `flex flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors ${selectedId === lib.libraryId
                            ? 'border-primary bg-primary/5'
                            : 'border-input hover:bg-accent'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-medium", children: lib.title }), _jsx("code", { className: "text-xs text-muted-foreground", children: lib.libraryId })] }), _jsx("span", { className: "text-xs text-muted-foreground line-clamp-1", children: lib.description })] }, lib.libraryId))) }) })), selectedId && (_jsx(Panel, { title: "Query Documentation", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsxs("p", { className: "text-xs text-muted-foreground", children: ["Library: ", _jsx("code", { className: "rounded bg-muted px-1.5 py-0.5", children: selectedId })] }), _jsx(FormField, { label: "Query", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter your query (e.g. how to use hooks)", value: query, onChange: (e) => setQuery(e.target.value), onKeyDown: (e) => {
                                            if (e.key === 'Enter')
                                                void handleGetDocs();
                                        }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleGetDocs(), disabled: loading || !query.trim(), className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: loading ? 'Loading...' : 'Query Docs' })] }) }), docs && _jsx(CodeBlock, { code: docs })] }) })), error && (_jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive", children: error })), history.length > 0 && (_jsx(Panel, { title: "Recent Searches", children: _jsx("div", { className: "flex flex-col gap-1.5", children: history.map((entry) => (_jsxs("button", { onClick: () => handleHistoryClick(entry), className: "flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left", children: [_jsx("span", { children: entry.libraryName }), _jsx("code", { className: "text-xs text-muted-foreground", children: entry.libraryId })] }, entry.libraryName))) }) }))] }));
}
