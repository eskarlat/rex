import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Panel, FormField } from '@renre-kit/extension-sdk/components';
const STORAGE_KEY = 'action-log';
const MAX_LOG = 50;
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
function generateId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
const BROWSER_ACTIONS = [
    {
        id: 'navigate',
        label: 'Navigate',
        description: 'Open a URL in the browser',
        tool: 'browser_navigate',
        fields: [{ name: 'url', label: 'URL', placeholder: 'https://example.com', required: true }],
    },
    {
        id: 'screenshot',
        label: 'Screenshot',
        description: 'Capture a screenshot of the current page',
        tool: 'browser_screenshot',
        fields: [],
    },
    {
        id: 'snapshot',
        label: 'Snapshot',
        description: 'Get an accessibility snapshot of the page',
        tool: 'browser_snapshot',
        fields: [],
    },
    {
        id: 'click',
        label: 'Click',
        description: 'Click an element on the page',
        tool: 'browser_click',
        fields: [
            { name: 'element', label: 'Element', placeholder: 'Submit button', required: true },
            { name: 'ref', label: 'Ref (from snapshot)', placeholder: 'e.g. 42' },
        ],
    },
    {
        id: 'type',
        label: 'Type',
        description: 'Type text into an input field',
        tool: 'browser_type',
        fields: [
            { name: 'element', label: 'Element', placeholder: 'Search input', required: true },
            { name: 'ref', label: 'Ref (from snapshot)', placeholder: 'e.g. 12' },
            { name: 'text', label: 'Text', placeholder: 'Hello world', required: true },
        ],
    },
    {
        id: 'evaluate',
        label: 'Run JS',
        description: 'Execute JavaScript in the browser console',
        tool: 'browser_evaluate',
        fields: [
            {
                name: 'expression',
                label: 'Expression',
                placeholder: 'document.title',
                required: true,
            },
        ],
    },
    {
        id: 'console',
        label: 'Console',
        description: 'Get browser console messages',
        tool: 'browser_console_messages',
        fields: [],
    },
    {
        id: 'network',
        label: 'Network',
        description: 'Get browser network requests',
        tool: 'browser_network_requests',
        fields: [],
    },
    {
        id: 'wait',
        label: 'Wait For',
        description: 'Wait for a condition on the page',
        tool: 'browser_wait_for',
        fields: [
            { name: 'text', label: 'Text to wait for', placeholder: 'Loading complete' },
            { name: 'selector', label: 'CSS selector', placeholder: '.result' },
        ],
    },
    {
        id: 'tab-list',
        label: 'List Tabs',
        description: 'List all open browser tabs',
        tool: 'browser_tab_list',
        fields: [],
    },
    {
        id: 'tab-create',
        label: 'New Tab',
        description: 'Open a new browser tab',
        tool: 'browser_tab_create',
        fields: [{ name: 'url', label: 'URL', placeholder: 'https://example.com' }],
    },
    {
        id: 'tab-close',
        label: 'Close Tab',
        description: 'Close a browser tab',
        tool: 'browser_tab_close',
        fields: [{ name: 'tabId', label: 'Tab ID', placeholder: 'Tab ID from list' }],
    },
    {
        id: 'performance',
        label: 'Perf Trace',
        description: 'Record a performance trace',
        tool: 'browser_performance_trace',
        fields: [],
    },
    {
        id: 'file-upload',
        label: 'File Upload',
        description: 'Upload a file to a file input element',
        tool: 'browser_file_upload',
        fields: [
            { name: 'paths', label: 'File paths', placeholder: '/path/to/file.png', required: true },
        ],
    },
];
export default function ChromeDevToolsPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'chrome-devtools-mcp';
    const [selectedAction, setSelectedAction] = useState(null);
    const [fieldValues, setFieldValues] = useState({});
    const [actionLog, setActionLog] = useState([]);
    const [running, setRunning] = useState(false);
    const [expandedEntry, setExpandedEntry] = useState(null);
    // Restore persisted action log on mount
    useEffect(() => {
        if (!sdk)
            return;
        void sdk.storage.get(STORAGE_KEY).then((stored) => {
            if (stored) {
                setActionLog(JSON.parse(stored));
            }
        });
    }, [sdk]);
    const persistLog = useCallback(async (entries) => {
        if (!sdk)
            return;
        const trimmed = entries.slice(0, MAX_LOG);
        await sdk.storage.set(STORAGE_KEY, JSON.stringify(trimmed));
    }, [sdk]);
    function handleSelectAction(actionId) {
        setSelectedAction(actionId);
        setFieldValues({});
    }
    function setField(name, value) {
        setFieldValues((prev) => ({ ...prev, [name]: value }));
    }
    async function handleRunAction() {
        if (!sdk || !selectedAction)
            return;
        const action = BROWSER_ACTIONS.find((a) => a.id === selectedAction);
        if (!action)
            return;
        // Validate required fields
        for (const field of action.fields) {
            if (field.required && !fieldValues[field.name]?.trim()) {
                sdk.ui.toast({ title: 'Missing field', description: `${field.label} is required` });
                return;
            }
        }
        const entry = {
            id: generateId(),
            action: action.id,
            label: action.label,
            params: { ...fieldValues },
            timestamp: Date.now(),
            status: 'running',
        };
        const updated = [entry, ...actionLog];
        setActionLog(updated);
        setRunning(true);
        try {
            const args = {};
            for (const field of action.fields) {
                const val = fieldValues[field.name];
                if (val?.trim()) {
                    args[field.name] = val.trim();
                }
            }
            const result = await sdk.exec.run(`${extName}:${action.tool}`, args);
            const { text, isError } = extractMcpText(result.output);
            entry.status = isError ? 'error' : 'success';
            entry.output = text;
        }
        catch (err) {
            entry.status = 'error';
            entry.output = err instanceof Error ? err.message : 'Action failed';
        }
        finally {
            setRunning(false);
            const final = [entry, ...actionLog.filter((e) => e.id !== entry.id)].slice(0, MAX_LOG);
            setActionLog(final);
            await persistLog(final);
        }
    }
    async function handleReplay(logEntry) {
        if (!sdk)
            return;
        const action = BROWSER_ACTIONS.find((a) => a.id === logEntry.action);
        if (!action)
            return;
        setSelectedAction(logEntry.action);
        setFieldValues(logEntry.params);
        const entry = {
            id: generateId(),
            action: logEntry.action,
            label: logEntry.label,
            params: { ...logEntry.params },
            timestamp: Date.now(),
            status: 'running',
        };
        const updated = [entry, ...actionLog];
        setActionLog(updated);
        setRunning(true);
        try {
            const args = {};
            for (const field of action.fields) {
                const val = logEntry.params[field.name];
                if (val?.trim()) {
                    args[field.name] = val.trim();
                }
            }
            const result = await sdk.exec.run(`${extName}:${action.tool}`, args);
            const { text, isError } = extractMcpText(result.output);
            entry.status = isError ? 'error' : 'success';
            entry.output = text;
        }
        catch (err) {
            entry.status = 'error';
            entry.output = err instanceof Error ? err.message : 'Replay failed';
        }
        finally {
            setRunning(false);
            const final = [entry, ...actionLog.filter((e) => e.id !== entry.id)].slice(0, MAX_LOG);
            setActionLog(final);
            await persistLog(final);
        }
    }
    async function handleClearLog() {
        setActionLog([]);
        if (sdk) {
            await sdk.storage.delete(STORAGE_KEY);
        }
    }
    const activeAction = BROWSER_ACTIONS.find((a) => a.id === selectedAction);
    const statusDot = (status) => {
        switch (status) {
            case 'running':
                return 'bg-yellow-500 animate-pulse';
            case 'success':
                return 'bg-green-500';
            case 'error':
                return 'bg-red-500';
        }
    };
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Chrome DevTools", description: "Control a live Chrome browser via the official DevTools MCP server.", children: _jsxs("div", { className: "flex items-center gap-1.5 text-xs text-muted-foreground", children: [_jsx("span", { className: "inline-block h-2 w-2 rounded-full bg-green-500" }), "MCP stdio transport"] }) }), _jsx(Panel, { title: "Browser Actions", children: _jsx("div", { className: "flex flex-wrap gap-1.5", children: BROWSER_ACTIONS.map((action) => (_jsx("button", { onClick: () => handleSelectAction(action.id), title: action.description, className: `inline-flex items-center rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${selectedAction === action.id
                            ? 'bg-primary text-primary-foreground'
                            : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'}`, children: action.label }, action.id))) }) }), activeAction && (_jsx(Panel, { title: activeAction.label, description: activeAction.description, children: _jsxs("div", { className: "flex flex-col gap-3", children: [activeAction.fields.map((field) => (_jsx(FormField, { label: field.label, children: _jsx("input", { type: "text", placeholder: field.placeholder, value: fieldValues[field.name] ?? '', onChange: (e) => setField(field.name, e.target.value), onKeyDown: (e) => {
                                    if (e.key === 'Enter')
                                        void handleRunAction();
                                }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }) }, field.name))), _jsx("button", { onClick: () => void handleRunAction(), disabled: running || !sdk, className: "inline-flex h-9 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: running ? 'Running...' : `Run ${activeAction.label}` })] }) })), _jsx(Panel, { title: "Action Log", children: _jsxs("div", { className: "flex flex-col gap-2", children: [actionLog.length === 0 && (_jsx("p", { className: "text-sm text-muted-foreground", children: "No actions yet. Select a browser action above to get started." })), actionLog.map((entry) => (_jsxs("div", { className: "flex flex-col rounded-md border border-input text-sm transition-colors", children: [_jsxs("button", { onClick: () => setExpandedEntry(expandedEntry === entry.id ? null : entry.id), className: "flex items-center justify-between p-2.5 text-left hover:bg-accent transition-colors", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: `inline-block h-2 w-2 shrink-0 rounded-full ${statusDot(entry.status)}` }), _jsx("span", { className: "font-medium", children: entry.label }), Object.values(entry.params).some((v) => v) && (_jsx("span", { className: "text-xs text-muted-foreground truncate max-w-[200px]", children: Object.values(entry.params)
                                                        .filter(Boolean)
                                                        .join(', ') }))] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsx("span", { className: "text-xs text-muted-foreground whitespace-nowrap", children: new Date(entry.timestamp).toLocaleTimeString() }), _jsx("span", { className: "text-xs text-muted-foreground", children: expandedEntry === entry.id ? '▲' : '▼' })] })] }), expandedEntry === entry.id && (_jsxs("div", { className: "border-t border-input p-2.5", children: [entry.output && (_jsx("pre", { className: "mb-2 max-h-48 overflow-auto rounded bg-muted p-2 text-xs whitespace-pre-wrap", children: entry.output })), _jsx("button", { onClick: () => void handleReplay(entry), disabled: running, className: "inline-flex h-7 items-center justify-center rounded border border-input bg-background px-3 text-xs font-medium hover:bg-accent disabled:opacity-50 disabled:pointer-events-none", children: "Replay" })] }))] }, entry.id))), actionLog.length > 0 && (_jsx("button", { onClick: () => void handleClearLog(), className: "mt-1 inline-flex h-7 w-fit items-center justify-center rounded border border-input bg-background px-3 text-xs text-muted-foreground hover:bg-accent", children: "Clear Log" }))] }) })] }));
}
