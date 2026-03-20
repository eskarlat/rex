import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
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
export default function BrowserWidget({ sdk, extensionName }) {
    const extName = extensionName ?? 'renre-devtools';
    const [status, setStatus] = useState('idle');
    const [pageTitle, setPageTitle] = useState(null);
    const [loading, setLoading] = useState(false);
    async function handleLaunch() {
        if (!sdk)
            return;
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, { url: 'about:blank' });
            const { isError } = extractMcpText(result.output);
            setStatus(isError ? 'error' : 'running');
            if (!isError)
                setPageTitle('New Tab');
        }
        catch {
            setStatus('error');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleRefresh() {
        if (!sdk)
            return;
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:puppeteer_evaluate`, {
                script: 'document.title',
            });
            const { text, isError } = extractMcpText(result.output);
            if (!isError)
                setPageTitle(text || 'Untitled');
        }
        catch {
            /* keep current state */
        }
        finally {
            setLoading(false);
        }
    }
    const statusColor = status === 'running' ? '#22c55e' : status === 'error' ? '#ef4444' : '#9ca3af';
    const statusLabel = status === 'running' ? 'Running' : status === 'error' ? 'Error' : 'Stopped';
    return (_jsxs("div", { style: { padding: '8px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }, children: [_jsx("span", { style: {
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: statusColor,
                            display: 'inline-block',
                        } }), _jsx("span", { style: { fontSize: '14px', fontWeight: 500 }, children: "Browser" }), _jsx("span", { style: {
                            fontSize: '11px',
                            color: 'var(--muted-foreground, #666)',
                            marginLeft: 'auto',
                        }, children: statusLabel })] }), pageTitle && (_jsx("p", { style: {
                    fontSize: '12px',
                    color: 'var(--muted-foreground, #666)',
                    margin: '0 0 8px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }, children: pageTitle })), _jsx("div", { style: { display: 'flex', gap: '6px' }, children: status !== 'running' ? (_jsx("button", { onClick: () => void handleLaunch(), disabled: loading || !sdk, style: {
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        cursor: loading || !sdk ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        background: 'transparent',
                        color: 'inherit',
                        opacity: loading || !sdk ? 0.5 : 1,
                    }, children: loading ? 'Starting...' : 'Launch' })) : (_jsx("button", { onClick: () => void handleRefresh(), disabled: loading, style: {
                        padding: '4px 12px',
                        borderRadius: '4px',
                        border: '1px solid #ccc',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '13px',
                        background: 'transparent',
                        color: 'inherit',
                        opacity: loading ? 0.5 : 1,
                    }, children: loading ? '...' : 'Refresh' })) })] }));
}
