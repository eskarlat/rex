import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
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
export default function PlaywrightPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'playwright-mcp';
    const [url, setUrl] = useState('');
    const [snapshot, setSnapshot] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    async function handleNavigate() {
        if (!sdk || !url.trim())
            return;
        setLoading(true);
        setError(null);
        setSnapshot(null);
        try {
            const result = await sdk.exec.run(`${extName}:browser_navigate`, { url: url.trim() });
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setSnapshot(text);
        }
        catch {
            setError('Failed to navigate. Check the URL and try again.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSnapshot() {
        if (!sdk)
            return;
        setLoading(true);
        setError(null);
        try {
            const result = await sdk.exec.run(`${extName}:browser_snapshot`);
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return;
            }
            setSnapshot(text);
        }
        catch {
            setError('Failed to take snapshot.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Playwright", description: "Browser automation and testing via Playwright MCP server.", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500" }), "MCP stdio transport"] }) }), _jsx(Panel, { title: "Navigate", children: _jsx("div", { className: "flex flex-col gap-3", children: _jsx(FormField, { label: "URL", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter URL (e.g. https://example.com)", value: url, onChange: (e) => setUrl(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter')
                                            void handleNavigate();
                                    }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleNavigate(), disabled: loading || !sdk || !url.trim(), className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading ? 'Loading...' : 'Go' })] }) }) }) }), _jsx(Panel, { title: "Actions", children: _jsx("div", { className: "flex gap-2", children: _jsx("button", { onClick: () => void handleSnapshot(), disabled: loading || !sdk, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: "Take Snapshot" }) }) }), snapshot && (_jsx(Panel, { title: "Result", children: _jsx(CodeBlock, { code: snapshot }) })), error && (_jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive", children: error }))] }));
}
