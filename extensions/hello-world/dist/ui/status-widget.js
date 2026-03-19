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
    return (_jsxs("div", { style: { padding: '8px' }, children: [_jsx("p", { style: { fontSize: '14px', fontWeight: 500, marginBottom: '8px' }, children: extName }), _jsx("button", { onClick: handleQuickGreet, disabled: loading || !sdk, style: {
                    padding: '4px 12px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                    cursor: loading ? 'wait' : 'pointer',
                    fontSize: '13px',
                }, children: loading ? 'Greeting...' : 'Quick Greet' }), output && (_jsx("p", { style: { fontSize: '13px', marginTop: '8px', color: '#666' }, children: output }))] }));
}
