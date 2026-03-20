import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Panel, FormField } from '@renre-kit/extension-sdk/components';
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
function normalizeRepo(repo) {
    return {
        name: repo.full_name ?? repo.name ?? '',
        description: repo.description ?? '',
        stargazers_count: repo.stargazers_count ?? 0,
    };
}
function parseRepositories(text) {
    try {
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
            return parsed.map(normalizeRepo);
        }
        return (parsed.items ?? []).map(normalizeRepo);
    }
    catch {
        return [];
    }
}
function parseIssues(text) {
    try {
        return JSON.parse(text);
    }
    catch {
        return [];
    }
}
export default function GitHubPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'github-mcp';
    const [searchQuery, setSearchQuery] = useState('');
    const [repositories, setRepositories] = useState([]);
    const [selectedRepo, setSelectedRepo] = useState(null);
    const [issues, setIssues] = useState([]);
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
        const updated = [entry, ...history.filter((h) => h.query !== entry.query)].slice(0, MAX_HISTORY);
        setHistory(updated);
        await sdk.storage.set('search-history', JSON.stringify(updated));
    }
    async function handleSearch() {
        if (!sdk || !searchQuery.trim())
            return;
        setLoading(true);
        setError(null);
        setRepositories([]);
        setSelectedRepo(null);
        setIssues([]);
        try {
            const result = await sdk.exec.run(`${extName}:search_repositories`, {
                query: searchQuery.trim(),
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            const parsed = parseRepositories(text);
            if (parsed.length === 0) {
                setError('No repositories found. Try a different query.');
                return;
            }
            setRepositories(parsed);
            setSelectedRepo(parsed[0].name);
            await saveToHistory({ query: searchQuery.trim(), timestamp: Date.now() });
        }
        catch {
            setError('Failed to search repositories. Check your token and try again.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleViewIssues() {
        if (!sdk || !selectedRepo)
            return;
        setLoading(true);
        setError(null);
        setIssues([]);
        try {
            const [owner, repo] = selectedRepo.split('/');
            const result = await sdk.exec.run(`${extName}:list_issues`, {
                owner: owner,
                repo: repo,
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setIssues(parseIssues(text));
        }
        catch {
            setError('Failed to fetch issues.');
        }
        finally {
            setLoading(false);
        }
    }
    function handleHistoryClick(entry) {
        setSearchQuery(entry.query);
        setRepositories([]);
        setSelectedRepo(null);
        setIssues([]);
        setError(null);
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "GitHub", description: "GitHub integration via official MCP server.", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500" }), "MCP stdio transport"] }) }), _jsx(Panel, { title: "Search Repositories", children: _jsx("div", { className: "flex flex-col gap-3", children: _jsx(FormField, { label: "Repository", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Search repository (e.g. react, next.js, express)", value: searchQuery, onChange: (e) => setSearchQuery(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter')
                                            void handleSearch();
                                    }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleSearch(), disabled: loading || !sdk, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading && repositories.length === 0 ? 'Searching...' : 'Search' })] }) }) }) }), repositories.length > 0 && (_jsxs(Panel, { title: "Repositories", children: [_jsx("div", { className: "flex flex-col gap-2", children: repositories.map((repo) => (_jsxs("button", { onClick: () => setSelectedRepo(repo.name), className: `flex flex-col gap-1 rounded-md border p-3 text-left text-sm transition-colors ${selectedRepo === repo.name
                                ? 'border-primary bg-primary/5'
                                : 'border-input hover:bg-accent'}`, children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "font-medium", children: repo.name }), _jsxs("span", { className: "text-xs text-muted-foreground", children: [repo.stargazers_count.toLocaleString(), " stars"] })] }), _jsx("span", { className: "text-xs text-muted-foreground line-clamp-1", children: repo.description })] }, repo.name))) }), selectedRepo && (_jsx("div", { className: "mt-3", children: _jsx("button", { onClick: () => void handleViewIssues(), disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: loading ? 'Loading...' : 'View Issues' }) }))] })), issues.length > 0 && (_jsx(Panel, { title: `Issues — ${selectedRepo ?? ''}`, children: _jsx("div", { className: "flex flex-col gap-1.5", children: issues.map((issue) => (_jsxs("div", { className: "flex items-center justify-between rounded-md border border-input p-2 text-sm", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `inline-block h-2 w-2 rounded-full ${issue.state === 'open' ? 'bg-green-500' : 'bg-purple-500'}` }), _jsx("span", { children: issue.title })] }), _jsxs("code", { className: "text-xs text-muted-foreground", children: ["#", issue.number] })] }, issue.number))) }) })), error && (_jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive", children: error })), history.length > 0 && (_jsx(Panel, { title: "Recent Searches", children: _jsx("div", { className: "flex flex-col gap-1.5", children: history.map((entry) => (_jsxs("button", { onClick: () => handleHistoryClick(entry), className: "flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left", children: [_jsx("span", { children: entry.query }), _jsx("span", { className: "text-xs text-muted-foreground", children: new Date(entry.timestamp).toLocaleDateString() })] }, entry.query))) }) }))] }));
}
