import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect, useCallback } from 'react';
import { Panel, FormField, CodeBlock, DataTable } from '@renre-kit/extension-sdk/components';
export default function HelloWorldPanel({ sdk, extensionName }) {
    const [greeting, setGreeting] = useState(null);
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [cronTask, setCronTask] = useState(null);
    const [cronLoading, setCronLoading] = useState(false);
    const [history, setHistory] = useState([]);
    const extName = extensionName ?? 'hello-world';
    async function handleGreet() {
        if (!sdk) {
            setGreeting(`Hello, ${name || 'World'}! (SDK not available)`);
            return;
        }
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:greet`, { name: name || undefined });
            setGreeting(result.output);
            setHistory((prev) => [
                { name: name || 'World', response: result.output, time: new Date().toLocaleTimeString() },
                ...prev.slice(0, 9),
            ]);
        }
        catch {
            setGreeting('Failed to execute greet command.');
        }
        finally {
            setLoading(false);
        }
    }
    function handleToast() {
        if (!sdk)
            return;
        sdk.ui.toast({
            title: 'Hello from extension!',
            description: `Greetings from ${extName} at ${new Date().toLocaleTimeString()}`,
        });
    }
    // Poll for task execution and show toasts
    const pollTask = useCallback(() => {
        if (!sdk || !cronTask)
            return;
        sdk.scheduler.list().then((tasks) => {
            const current = tasks.find((t) => t.id === cronTask.id);
            if (current && current.last_run_at !== cronTask.last_run_at) {
                setCronTask(current);
                sdk.ui.toast({
                    title: 'Cron tick',
                    description: `Task ran at ${current.last_run_at ?? 'unknown'}`,
                });
            }
        }).catch(() => { });
    }, [sdk, cronTask]);
    useEffect(() => {
        if (!cronTask)
            return;
        const interval = setInterval(pollTask, 2000);
        return () => clearInterval(interval);
    }, [cronTask, pollTask]);
    async function handleCronToggle() {
        if (!sdk)
            return;
        setCronLoading(true);
        try {
            if (cronTask) {
                await sdk.scheduler.unregister(cronTask.id);
                sdk.ui.toast({ title: 'Cron stopped', variant: 'destructive' });
                setCronTask(null);
            }
            else {
                const task = await sdk.scheduler.register({
                    extension_name: extName,
                    cron: '*/3 * * * * *',
                    command: `renre-kit ${extName}:greet`,
                });
                setCronTask(task);
                sdk.ui.toast({ title: 'Cron started', description: 'Running every 3 seconds' });
            }
        }
        catch {
            sdk.ui.toast({ title: 'Cron error', description: 'Failed to toggle cron task', variant: 'destructive' });
        }
        finally {
            setCronLoading(false);
        }
    }
    async function handleInfo() {
        if (!sdk)
            return;
        try {
            const result = await sdk.exec.run(`${extName}:info`);
            setGreeting(result.output);
        }
        catch {
            setGreeting('Failed to execute info command.');
        }
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Greet", description: "Send a greeting with an optional name. Uses companyName from extension settings.", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(FormField, { label: "Name", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter a name...", value: name, onChange: (e) => setName(e.target.value), onKeyDown: (e) => { if (e.key === 'Enter')
                                            handleGreet().catch(() => { }); }, className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => { handleGreet().catch(() => { }); }, disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: loading ? 'Running...' : 'Greet' })] }) }), greeting && _jsx(CodeBlock, { code: greeting })] }) }), _jsx(Panel, { title: "Toast & Cron Demo", description: "Demonstrates SDK toast notifications and interval-based cron execution.", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("button", { onClick: handleToast, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90", children: "Show Toast" }), _jsx("button", { onClick: () => { handleCronToggle().catch(() => { }); }, disabled: cronLoading, className: cronTask
                                ? 'inline-flex h-9 items-center justify-center rounded-md border border-destructive bg-destructive/10 px-4 text-sm font-medium text-destructive shadow-sm hover:bg-destructive/20 disabled:opacity-50'
                                : 'inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50', children: cronLoading ? '...' : cronTask ? 'Stop Cron' : 'Start Cron (every 3s)' })] }) }), _jsx(Panel, { title: "Extension Info", description: "View extension version and metadata.", children: _jsx("button", { onClick: () => { handleInfo().catch(() => { }); }, className: "inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground", children: "Show Info" }) }), _jsx(Panel, { title: "Commands", description: "Available CLI commands for this extension.", children: _jsx(DataTable, { columns: [
                        { key: 'command', label: 'Command' },
                        { key: 'description', label: 'Description' },
                    ], data: [
                        { command: `${extName}:greet`, description: 'Greet the user with a friendly message' },
                        { command: `${extName}:info`, description: 'Show extension info' },
                    ] }) }), history.length > 0 && (_jsx(Panel, { title: "Greeting History", description: "Recent greetings from this session.", children: _jsx(DataTable, { columns: [
                        { key: 'time', label: 'Time' },
                        { key: 'name', label: 'Name' },
                        { key: 'response', label: 'Response' },
                    ], data: history }) }))] }));
}
