import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
export default function StatusWidget({ sdk, extensionName }) {
    const [output, setOutput] = useState(null);
    const [loading, setLoading] = useState(false);
    const extName = extensionName ?? 'hello-world';
    async function handleQuickGreet() {
        if (!sdk)
            return;
        setLoading(true);
        try {
            const result = await sdk.exec.run(`${extName}:greet`, {});
            setOutput(result.output);
        }
        finally {
            setLoading(false);
        }
    }
    return (_jsxs("div", { className: "p-2", children: [_jsx("p", { className: "mb-2 text-sm font-medium", children: extName }), _jsx("button", { onClick: handleQuickGreet, disabled: loading || !sdk, className: "inline-flex h-8 items-center rounded border border-border px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50", children: loading ? 'Greeting...' : 'Quick Greet' }), output && _jsx("p", { className: "mt-2 text-xs text-muted-foreground", children: output })] }));
}
