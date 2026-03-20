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
function extractFileName(text) {
    try {
        const parsed = JSON.parse(text);
        return parsed.name ?? 'Unknown';
    }
    catch {
        const nameMatch = /"name"\s*:\s*"([^"]+)"/.exec(text);
        return nameMatch?.[1] ?? 'Unknown';
    }
}
export default function FigmaPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'figma-mcp';
    const [fileKey, setFileKey] = useState('');
    const [fileData, setFileData] = useState(null);
    const [comments, setComments] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    useEffect(() => {
        if (!sdk)
            return;
        void sdk.storage.get('file-history').then((raw) => {
            if (raw) {
                setHistory(JSON.parse(raw));
            }
        });
    }, [sdk]);
    async function saveToHistory(entry) {
        if (!sdk)
            return;
        const updated = [entry, ...history.filter((h) => h.fileKey !== entry.fileKey)].slice(0, MAX_HISTORY);
        setHistory(updated);
        await sdk.storage.set('file-history', JSON.stringify(updated));
    }
    async function handleGetFile() {
        if (!sdk || !fileKey.trim())
            return;
        setLoading(true);
        setError(null);
        setFileData(null);
        setComments(null);
        try {
            const result = await sdk.exec.run(`${extName}:get_file`, {
                fileKey: fileKey.trim(),
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setFileData(text);
            const fileName = extractFileName(text);
            await saveToHistory({ fileKey: fileKey.trim(), fileName, timestamp: Date.now() });
        }
        catch {
            setError('Failed to fetch file. Check the file key and try again.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleGetComments() {
        if (!sdk || !fileKey.trim())
            return;
        setLoading(true);
        setError(null);
        setComments(null);
        try {
            const result = await sdk.exec.run(`${extName}:get_comments`, {
                fileKey: fileKey.trim(),
            });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setComments(text);
        }
        catch {
            setError('Failed to fetch comments.');
        }
        finally {
            setLoading(false);
        }
    }
    function handleHistoryClick(entry) {
        setFileKey(entry.fileKey);
        setFileData(null);
        setComments(null);
        setError(null);
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Figma", description: "Figma design file tools via MCP server.", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500" }), "MCP SSE transport"] }) }), _jsx(Panel, { title: "File Browser", children: _jsx("div", { className: "flex flex-col gap-3", children: _jsx(FormField, { label: "File Key", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter Figma file key (e.g. abc123XYZ)", value: fileKey, onChange: (e) => setFileKey(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                        void handleGetFile(); }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleGetFile(), disabled: loading || !sdk, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading && !fileData ? 'Loading...' : 'Get File' })] }) }) }) }), fileData && (_jsx(Panel, { title: "File Info", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: () => void handleGetComments(), disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: loading && !comments ? 'Loading...' : 'Get Comments' }) }), _jsx(CodeBlock, { code: fileData })] }) })), comments && (_jsx(Panel, { title: "Comments", children: _jsx(CodeBlock, { code: comments }) })), error && (_jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive", children: error })), history.length > 0 && (_jsx(Panel, { title: "Recent Files", children: _jsx("div", { className: "flex flex-col gap-1.5", children: history.map((entry) => (_jsxs("button", { onClick: () => handleHistoryClick(entry), className: "flex w-full items-center justify-between rounded-md border border-input p-2 text-sm hover:bg-accent transition-colors text-left", children: [_jsx("span", { children: entry.fileName }), _jsx("code", { className: "text-xs text-muted-foreground", children: entry.fileKey })] }, entry.fileKey))) }) }))] }));
}
