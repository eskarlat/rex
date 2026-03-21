import { jsx as _jsx } from 'react/jsx-runtime';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Context7Panel from './panel.js';
function createMockSdk(overrides = {}) {
  return {
    exec: {
      run: vi.fn().mockResolvedValue({ output: '', exitCode: 0 }),
    },
    storage: {
      get: vi.fn().mockResolvedValue(null),
      set: vi.fn().mockResolvedValue(undefined),
    },
    ...overrides,
  };
}
describe('Context7Panel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  it('renders header with title and description', () => {
    render(_jsx(Context7Panel, {}));
    expect(screen.getByText('Context7')).toBeInTheDocument();
    expect(screen.getByText(/library documentation lookup/i)).toBeInTheDocument();
  });
  it('renders search input and button', () => {
    render(_jsx(Context7Panel, {}));
    expect(screen.getByPlaceholderText(/library name/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /search/i })).toBeInTheDocument();
  });
  it('renders gracefully without SDK', () => {
    render(_jsx(Context7Panel, {}));
    expect(screen.getByText('Context7')).toBeInTheDocument();
  });
  it('calls resolve-library-id on search submit', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({
      output: JSON.stringify({ libraryId: '/react/docs' }),
      exitCode: 0,
    });
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('context7-mcp:resolve-library-id', {
        libraryName: 'react',
      });
    });
  });
  it('shows resolved library ID after successful resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({
      output: '/react/docs',
      exitCode: 0,
    });
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.getAllByText(/\/react\/docs/).length).toBeGreaterThan(0);
    });
  });
  it('calls get-library-docs with resolved ID and topic', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: '/react/docs', exitCode: 0 })
      .mockResolvedValueOnce({ output: '# React Hooks\n...', exitCode: 0 });
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/topic/i)).toBeInTheDocument();
    });
    await user.type(screen.getByPlaceholderText(/topic/i), 'hooks');
    await user.click(screen.getByRole('button', { name: /get docs/i }));
    await waitFor(() => {
      expect(sdk.exec.run).toHaveBeenCalledWith('context7-mcp:get-library-docs', {
        context7CompatibleLibraryID: '/react/docs',
        topic: 'hooks',
      });
    });
  });
  it('displays documentation in pre block', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run
      .mockResolvedValueOnce({ output: '/react/docs', exitCode: 0 })
      .mockResolvedValueOnce({ output: '# React Hooks\nuseMemo, useCallback', exitCode: 0 });
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/topic/i)).toBeInTheDocument();
    });
    await user.click(screen.getByRole('button', { name: /get docs/i }));
    await waitFor(() => {
      expect(screen.getByText(/React Hooks/)).toBeInTheDocument();
    });
  });
  it('handles error state on failed resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockRejectedValueOnce(new Error('Connection failed'));
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(screen.getByText(/failed/i)).toBeInTheDocument();
    });
  });
  it('saves search to history on successful resolve', async () => {
    const user = userEvent.setup();
    const sdk = createMockSdk();
    sdk.exec.run.mockResolvedValueOnce({ output: '/react/docs', exitCode: 0 });
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await user.type(screen.getByPlaceholderText(/library name/i), 'react');
    await user.click(screen.getByRole('button', { name: /search/i }));
    await waitFor(() => {
      expect(sdk.storage.set).toHaveBeenCalledWith(
        'search-history',
        expect.stringContaining('react'),
      );
    });
  });
  it('loads and renders search history from storage', async () => {
    const sdk = createMockSdk();
    const history = [
      { libraryName: 'express', libraryId: '/express/docs', timestamp: Date.now() },
      { libraryName: 'zod', libraryId: '/zod/docs', timestamp: Date.now() - 1000 },
    ];
    sdk.storage.get.mockResolvedValueOnce(JSON.stringify(history));
    render(_jsx(Context7Panel, { sdk: sdk, extensionName: 'context7-mcp' }));
    await waitFor(() => {
      expect(screen.getByText('express')).toBeInTheDocument();
      expect(screen.getByText('zod')).toBeInTheDocument();
    });
  });
});
