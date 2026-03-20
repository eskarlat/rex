import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import MiroPanel from './panel.js';
function createMockSdk() {
    return {
        exec: {
            run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
        },
    };
}
describe('MiroPanel', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    afterEach(() => {
        cleanup();
    });
    it('renders panel title', () => {
        render(_jsx(MiroPanel, {}));
        expect(screen.getByText('Miro MCP')).toBeInTheDocument();
    });
    it('renders description', () => {
        render(_jsx(MiroPanel, {}));
        expect(screen.getByText(/98 tools across 21 toolsets/)).toBeInTheDocument();
    });
    it('renders check status button', () => {
        render(_jsx(MiroPanel, {}));
        expect(screen.getByRole('button', { name: /check status/i })).toBeInTheDocument();
    });
    it('calls miro-mcp:status on button click', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockResolvedValueOnce({
            output: 'miro-mcp v1.0.0\nStatus: ready',
            exitCode: 0,
        });
        render(_jsx(MiroPanel, { sdk: sdk, extensionName: "miro-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(sdk.exec.run).toHaveBeenCalledWith('miro-mcp:status');
        });
    });
    it('displays status output after check', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockResolvedValueOnce({
            output: 'miro-mcp v1.0.0\nStatus: ready',
            exitCode: 0,
        });
        render(_jsx(MiroPanel, { sdk: sdk, extensionName: "miro-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(screen.getByText(/Status: ready/)).toBeInTheDocument();
        });
    });
    it('shows SDK not available without SDK', async () => {
        const user = userEvent.setup();
        render(_jsx(MiroPanel, {}));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(screen.getByText('SDK not available')).toBeInTheDocument();
        });
    });
    it('handles error from SDK', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));
        render(_jsx(MiroPanel, { sdk: sdk, extensionName: "miro-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(screen.getByText('Failed to check status.')).toBeInTheDocument();
        });
    });
    it('shows loading state while checking', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        let resolveRun;
        sdk.exec.run.mockReturnValueOnce(new Promise((resolve) => {
            resolveRun = resolve;
        }));
        render(_jsx(MiroPanel, { sdk: sdk, extensionName: "miro-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        expect(screen.getByText(/checking/i)).toBeInTheDocument();
        resolveRun({ output: 'ok', exitCode: 0 });
        await waitFor(() => {
            expect(screen.queryByText(/checking/i)).not.toBeInTheDocument();
        });
    });
});
