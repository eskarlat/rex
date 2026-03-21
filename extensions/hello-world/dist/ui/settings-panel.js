import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Panel, FormField, CodeBlock } from '@renre-kit/extension-sdk/components';
export default function SettingsPanel({ sdk, extensionName }) {
    const extName = extensionName ?? 'hello-world';
    const [info, setInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [greeting, setGreeting] = useState('');
    const [savedGreeting, setSavedGreeting] = useState(null);
    useEffect(() => {
        if (!sdk)
            return;
        sdk.storage
            .get('custom-greeting')
            .then((val) => {
            if (val) {
                setSavedGreeting(String(val));
                setGreeting(String(val));
            }
        })
            .catch(() => { });
    }, [sdk]);
    async function handleLoadInfo() {
        if (!sdk)
            return;
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:info`);
            setInfo(result.output);
        }
        catch {
            setInfo('Failed to load extension info.');
        }
        finally {
            setLoading(false);
        }
    }
    async function handleSaveGreeting() {
        if (!sdk)
            return;
        setLoading(true);
        try {
            await sdk.storage.set('custom-greeting', greeting);
            setSavedGreeting(greeting);
            sdk.ui.toast({ title: 'Saved', description: 'Custom greeting updated.' });
        }
        catch {
            sdk.ui.toast({
                title: 'Error',
                description: 'Failed to save greeting.',
                variant: 'destructive',
            });
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsx(Panel, { title: "Extension Info", description: `View metadata and status for ${extName}.`, children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx("button", { onClick: () => {
                                handleLoadInfo().catch(() => { });
                            }, disabled: loading, className: "inline-flex h-9 w-fit items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50", children: loading ? 'Loading...' : 'Load Info' }), info && _jsx(CodeBlock, { code: info })] }) }), _jsx(Panel, { title: "Custom Greeting", description: "Set a custom greeting message stored in extension storage.", children: _jsxs("div", { className: "flex flex-col gap-3", children: [_jsx(FormField, { label: "Greeting Message", children: _jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "text", placeholder: "Enter a custom greeting...", value: greeting, onChange: (e) => setGreeting(e.target.value), className: "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" }), _jsx("button", { onClick: () => {
                                            handleSaveGreeting().catch(() => { });
                                        }, disabled: loading, className: "inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none", children: "Save" })] }) }), savedGreeting && (_jsxs("p", { className: "text-sm text-muted-foreground", children: ["Current: ", _jsx("span", { className: "font-medium text-foreground", children: savedGreeting })] }))] }) })] }));
}
