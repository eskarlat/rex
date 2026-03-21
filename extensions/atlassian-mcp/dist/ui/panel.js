import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function AtlassianPanel({ sdk, extensionName }) {
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(false);
    const extName = extensionName ?? 'atlassian-mcp';
    async function handleCheckStatus() {
        if (!sdk) {
            setStatus('SDK not available');
            return;
        }
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:status`);
            setStatus(result.output);
        }
        catch {
            setStatus('Failed to check status.');
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "rounded-lg border border-border p-6", children: [_jsx("h2", { className: "mb-2 text-xl font-semibold", children: "Atlassian MCP" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Jira and Confluence integration \u2014 72 tools across 21 toolsets." }), _jsxs("div", { className: "mt-2 inline-flex items-center gap-1.5", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-[#0052CC]" }), _jsx("span", { className: "text-xs text-muted-foreground", children: "MCP stdio transport" })] })] }), _jsxs("div", { className: "rounded-lg border border-border p-6", children: [_jsx("h3", { className: "mb-3 text-base font-medium", children: "Connection Status" }), _jsx("button", { onClick: () => {
                            handleCheckStatus().catch(() => { });
                        }, disabled: loading, className: "inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50", children: loading ? 'Checking...' : 'Check Status' }), status && (_jsx("pre", { className: "mt-3 whitespace-pre-wrap rounded-md bg-muted p-3 font-mono text-[13px]", children: status }))] })] }));
}
