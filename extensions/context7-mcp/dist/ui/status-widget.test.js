import { jsx as _jsx } from "react/jsx-runtime";
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import StatusWidget from './status-widget.js';
function createMockSdk() {
    return {
        exec: {
            run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
        },
    };
}
describe('StatusWidget', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });
    it('renders extension name', () => {
        render(_jsx(StatusWidget, { extensionName: "context7-mcp" }));
        expect(screen.getByText('context7-mcp')).toBeInTheDocument();
    });
    it('renders check status button', () => {
        render(_jsx(StatusWidget, {}));
        expect(screen.getByRole('button', { name: /check status/i })).toBeInTheDocument();
    });
    it('renders gracefully without SDK', () => {
        render(_jsx(StatusWidget, {}));
        expect(screen.getByText('context7-mcp')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /check status/i })).toBeDisabled();
    });
    it('calls context7-mcp:status on button click', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockResolvedValueOnce({
            output: 'context7-mcp v1.0.0\nStatus: ready',
            exitCode: 0,
        });
        render(_jsx(StatusWidget, { sdk: sdk, extensionName: "context7-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(sdk.exec.run).toHaveBeenCalledWith('context7-mcp:status');
        });
    });
    it('displays status output after check', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockResolvedValueOnce({
            output: 'context7-mcp v1.0.0\nStatus: ready',
            exitCode: 0,
        });
        render(_jsx(StatusWidget, { sdk: sdk, extensionName: "context7-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(screen.getByText(/Status: ready/)).toBeInTheDocument();
        });
    });
    it('shows loading state while checking', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        let resolveRun;
        sdk.exec.run.mockReturnValueOnce(new Promise((resolve) => {
            resolveRun = resolve;
        }));
        render(_jsx(StatusWidget, { sdk: sdk, extensionName: "context7-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        expect(screen.getByText(/checking/i)).toBeInTheDocument();
        resolveRun({ output: 'ok', exitCode: 0 });
        await waitFor(() => {
            expect(screen.queryByText(/checking/i)).not.toBeInTheDocument();
        });
    });
    it('handles error state', async () => {
        const user = userEvent.setup();
        const sdk = createMockSdk();
        sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));
        render(_jsx(StatusWidget, { sdk: sdk, extensionName: "context7-mcp" }));
        await user.click(screen.getByRole('button', { name: /check status/i }));
        await waitFor(() => {
            expect(screen.getByText(/failed/i)).toBeInTheDocument();
        });
    });
});
