import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function StatusWidget({ sdk, extensionName }) {
    const extName = extensionName ?? 'miro-mcp';
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    async function handleCheckStatus() {
        if (!sdk)
            return;
        setLoading(true);
        setError(null);
        try {
            const result = await sdk.exec.run(`${extName}:status`);
            setOutput(result.output);
        }
        catch {
            setError('Failed to check status.');
            setOutput(null);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "p-2", children: [_jsxs("div", { className: "mb-2 flex items-center gap-1.5", children: [_jsx("span", { className: `inline-block h-2 w-2 rounded-full ${error ? 'bg-red-500' : 'bg-emerald-500'}` }), _jsx("span", { className: "text-sm font-medium", children: extName })] }), _jsx("button", { onClick: () => void handleCheckStatus(), disabled: loading || !sdk, className: "inline-flex h-8 items-center rounded border border-border bg-transparent px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50", children: loading ? 'Checking...' : 'Check Status' }), output && (_jsx("pre", { className: "mt-2 whitespace-pre-wrap text-xs text-muted-foreground", children: output })), error && _jsx("p", { className: "mt-2 text-xs text-red-500", children: error })] }));
}
