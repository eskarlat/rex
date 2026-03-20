import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useCallback } from 'react';
import { Panel, CodeBlock, EmptyState } from '@renre-kit/extension-sdk/components';
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
export default function BrowserDevtoolsPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'renre-devtools';
    const [browserRunning, setBrowserRunning] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [currentUrl, setCurrentUrl] = useState(null);
    const [navigateUrl, setNavigateUrl] = useState('');
    const [consoleLogs, setConsoleLogs] = useState([]);
    const [jsCode, setJsCode] = useState('');
    const [evalResult, setEvalResult] = useState(null);
    const [screenshotData, setScreenshotData] = useState(null);
    const runTool = useCallback(async (tool, args = {}) => {
        if (!sdk)
            return null;
        setError(null);
        try {
            const result = await sdk.exec.run(`${extName}:${tool}`, args);
            const { text, isError } = extractMcpText(result.output);
            if (isError) {
                setError(text);
                return null;
            }
            return text;
        }
        catch {
            setError(`Failed to execute ${tool}`);
            return null;
        }
    }, [sdk, extName]);
    async function handleStartBrowser() {
        setLoading(true);
        const result = await runTool('puppeteer_navigate', { url: 'about:blank' });
        if (result !== null) {
            setBrowserRunning(true);
            setCurrentUrl('about:blank');
            sdk?.ui.toast({ title: 'Browser started', description: 'Headed browser window is now open.' });
        }
        setLoading(false);
    }
    async function handleNavigate() {
        if (!navigateUrl.trim())
            return;
        setLoading(true);
        const url = navigateUrl.trim();
        const result = await runTool('puppeteer_navigate', { url });
        if (result !== null) {
            setCurrentUrl(url);
            setScreenshotData(null);
        }
        setLoading(false);
    }
    async function handleScreenshot() {
        setLoading(true);
        const result = await runTool('puppeteer_screenshot', {
            name: `capture-${Date.now()}`,
            encoded: true,
        });
        if (result !== null) {
            setScreenshotData(result);
        }
        setLoading(false);
    }
    async function handleGetConsole() {
        setLoading(true);
        const result = await runTool('puppeteer_evaluate', {
            script: 'JSON.stringify({ url: document.URL, title: document.title })',
        });
        if (result !== null) {
            try {
                const info = JSON.parse(result);
                setCurrentUrl(info.url ?? currentUrl);
                setConsoleLogs((prev) => [
                    ...prev,
                    {
                        type: 'info',
                        text: `Page: ${info.title ?? 'Untitled'} — ${info.url ?? ''}`,
                        timestamp: Date.now(),
                    },
                ]);
            }
            catch {
                setConsoleLogs((prev) => [
                    ...prev,
                    { type: 'info', text: result, timestamp: Date.now() },
                ]);
            }
        }
        setLoading(false);
    }
    async function handleEvaluate() {
        if (!jsCode.trim())
            return;
        setLoading(true);
        const result = await runTool('puppeteer_evaluate', { script: jsCode.trim() });
        if (result !== null) {
            setEvalResult(result);
            setConsoleLogs((prev) => [
                ...prev,
                { type: 'eval', text: `> ${jsCode.trim()}\n${result}`, timestamp: Date.now() },
            ]);
        }
        setLoading(false);
    }
    function handleStopBrowser() {
        setBrowserRunning(false);
        setCurrentUrl(null);
        setConsoleLogs([]);
        setScreenshotData(null);
        setEvalResult(null);
        sdk?.ui.toast({
            title: 'Browser stopped',
            description: 'Browser session ended. Start a new one to continue.',
        });
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Browser Devtools", description: "Control a headed Puppeteer browser instance for site debugging, DOM inspection, and visual testing.", children: _jsxs("div", { className: "text-sm text-muted-foreground space-y-2", children: [_jsx("p", { children: "This extension launches a real browser window you can see and interact with. Use the controls below to navigate, inspect pages, take screenshots, and run JavaScript." }), _jsx("p", { children: "LLM skills are available for automated debugging \u2014 the AI can navigate pages, click elements, fill forms, inspect the DOM, and capture screenshots on your behalf." }), _jsxs("div", { className: "flex items-center gap-1.5 mt-2", children: [_jsx("span", { className: `inline-block h-2 w-2 rounded-full ${browserRunning ? 'bg-green-500' : 'bg-gray-400'}` }), _jsx("span", { className: "text-xs", children: browserRunning ? 'Browser running' : 'Browser stopped' })] })] }) }), _jsx(Panel, { title: "Browser Control", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("div", { className: "flex gap-2", children: !browserRunning ? (_jsx("button", { onClick: () => void handleStartBrowser(), disabled: loading || !sdk, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading ? 'Starting...' : 'Open Browser' })) : (_jsx("button", { onClick: () => handleStopBrowser(), className: "inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow hover:bg-destructive/90", children: "Stop Browser" })) }), currentUrl && (_jsxs("div", { className: "text-xs text-muted-foreground", children: ["Current: ", _jsx("code", { className: "bg-muted px-1 rounded", children: currentUrl })] }))] }) }), browserRunning && (_jsx(Panel, { title: "Navigate", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "https://example.com", value: navigateUrl, onChange: (e) => setNavigateUrl(e.target.value), onKeyDown: (e) => {
                                if (e.key === 'Enter')
                                    void handleNavigate();
                            }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleNavigate(), disabled: loading || !navigateUrl.trim(), className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap", children: "Go" })] }) })), browserRunning && (_jsx(Panel, { title: "Actions", children: _jsxs("div", { className: "flex flex-wrap gap-2", children: [_jsx("button", { onClick: () => void handleScreenshot(), disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: "Screenshot" }), _jsx("button", { onClick: () => void handleGetConsole(), disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none", children: "Page Info" })] }) })), screenshotData && (_jsx(Panel, { title: "Screenshot", children: _jsx("div", { className: "rounded-md border border-input overflow-hidden", children: _jsx("img", { src: screenshotData.startsWith('data:') ? screenshotData : `data:image/png;base64,${screenshotData}`, alt: "Browser screenshot", className: "w-full h-auto" }) }) })), browserRunning && (_jsx(Panel, { title: "JavaScript Console", children: _jsxs("div", { className: "flex flex-col gap-2", children: [_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "document.title", value: jsCode, onChange: (e) => setJsCode(e.target.value), onKeyDown: (e) => {
                                        if (e.key === 'Enter')
                                            void handleEvaluate();
                                    }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => void handleEvaluate(), disabled: loading || !jsCode.trim(), className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap", children: "Run" })] }), evalResult && _jsx(CodeBlock, { code: evalResult })] }) })), consoleLogs.length > 0 && (_jsx(Panel, { title: "Console Output", children: _jsx("div", { className: "flex flex-col gap-1 max-h-64 overflow-y-auto", children: consoleLogs.map((log) => (_jsxs("div", { className: "flex items-start gap-2 text-xs font-mono text-muted-foreground", children: [_jsx("span", { className: "text-[10px] opacity-50 shrink-0", children: new Date(log.timestamp).toLocaleTimeString() }), _jsx("pre", { className: "whitespace-pre-wrap break-all", children: log.text })] }, log.timestamp))) }) })), !browserRunning && !error && (_jsx(EmptyState, { title: "No browser running", description: "Click 'Open Browser' above to launch a headed Puppeteer browser instance. You'll be able to navigate pages, take screenshots, run JavaScript, and inspect the DOM." })), error && (_jsx("div", { className: "rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive", children: error }))] }));
}
