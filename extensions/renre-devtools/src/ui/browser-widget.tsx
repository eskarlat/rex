import { useState, useCallback, useEffect, useRef } from 'react';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface McpResponse {
  content?: { text?: string }[];
  isError?: boolean;
}

function extractMcpText(raw: string): { text: string; isError: boolean } {
  try {
    const parsed = JSON.parse(raw) as McpResponse;
    const text = parsed.content?.[0]?.text ?? raw;
    return { text, isError: !!parsed.isError };
  } catch (err) {
    console.warn('[renre-devtools] Failed to parse MCP response as JSON:', err);
    return { text: raw, isError: false };
  }
}

function isChromeNotInstalled(errorText: string): boolean {
  return (
    errorText.includes('Could not find Chrome') ||
    errorText.includes('puppeteer browsers install')
  );
}

type WidgetStatus = 'checking' | 'no-chrome' | 'idle' | 'running' | 'error' | 'crashed';

export default function BrowserWidget({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'renre-devtools';
  const [status, setStatus] = useState<WidgetStatus>('checking');
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [installing, setInstalling] = useState(false);
  const loadingRef = useRef(false);

  // Check Chrome availability on mount
  useEffect(() => {
    if (!sdk) {
      setStatus('idle');
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
          url: 'about:blank',
        });
        if (cancelled) return;
        const { isError, text } = extractMcpText(result.output);
        if (isError && isChromeNotInstalled(text)) {
          setStatus('no-chrome');
        } else if (isError) {
          setStatus('error');
        } else {
          setStatus('running');
          setPageTitle('New Tab');
          setCurrentUrl('about:blank');
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        if (isChromeNotInstalled(msg)) {
          setStatus('no-chrome');
        } else {
          setStatus('idle');
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sdk, extName]);

  const fetchPageInfo = useCallback(async (): Promise<boolean> => {
    if (!sdk || loadingRef.current) return true;
    try {
      const result = await sdk.exec.run(`${extName}:puppeteer_evaluate`, {
        script: 'JSON.stringify({ url: document.URL, title: document.title })',
      });
      const { text, isError } = extractMcpText(result.output);
      if (isError) return true;
      try {
        const info = JSON.parse(text) as { url?: string; title?: string };
        setCurrentUrl(info.url ?? null);
        setPageTitle(info.title ?? null);
      } catch (err) {
        console.warn('[renre-devtools] Failed to parse page info:', err);
      }
      return true;
    } catch (err) {
      console.error('[renre-devtools] fetchPageInfo failed:', err);
      return false;
    }
  }, [sdk, extName]);

  async function handleLaunch() {
    if (!sdk) return;
    setLoading(true);
    try {
      const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
        url: 'about:blank',
      });
      const { isError, text } = extractMcpText(result.output);
      if (isError && isChromeNotInstalled(text)) {
        setStatus('no-chrome');
        setLoading(false);
        return;
      }
      setStatus(isError ? 'error' : 'running');
      if (!isError) {
        setPageTitle('New Tab');
        loadingRef.current = false;
        setLoading(false);
        void fetchPageInfo();
        return;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (isChromeNotInstalled(msg)) {
        setStatus('no-chrome');
      } else {
        setStatus('error');
      }
    }
    setLoading(false);
  }

  async function handleRefresh() {
    if (!sdk) return;
    setLoading(true);
    try {
      await fetchPageInfo();
    } catch (err) {
      console.warn('[renre-devtools] Refresh failed:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleInstallChrome() {
    if (!sdk) return;
    setInstalling(true);
    sdk.terminal.open();
    sdk.terminal.send('npx puppeteer browsers install chrome\n');
    const pollTimer = setInterval(() => {
      void (async () => {
        try {
          const result = await sdk.exec.run(`${extName}:puppeteer_navigate`, {
            url: 'about:blank',
          });
          const { isError, text } = extractMcpText(result.output);
          if (!isError || !isChromeNotInstalled(text)) {
            clearInterval(pollTimer);
            setInstalling(false);
            setStatus(isError ? 'error' : 'running');
            if (!isError) {
              setPageTitle('New Tab');
              setCurrentUrl('about:blank');
            }
          }
        } catch (err) {
          console.warn('[renre-devtools] Chrome install poll failed:', err);
        }
      })();
    }, 5000);
    setTimeout(() => {
      clearInterval(pollTimer);
      setInstalling(false);
    }, 120_000);
  }

  loadingRef.current = loading;

  // Health check polling
  useEffect(() => {
    if (status !== 'running' || !sdk) return;
    const interval = setInterval(() => {
      if (loadingRef.current) return;
      void fetchPageInfo().then((alive) => {
        if (!alive) {
          setStatus('crashed');
          setPageTitle(null);
          setCurrentUrl(null);
        }
      });
    }, 10_000);
    return () => clearInterval(interval);
  }, [status, sdk, fetchPageInfo]);

  const statusDot =
    status === 'running'
      ? 'bg-emerald-500'
      : status === 'error' || status === 'crashed'
        ? 'bg-red-500'
        : status === 'no-chrome'
          ? 'bg-amber-500'
          : status === 'checking'
            ? 'bg-blue-400 animate-pulse'
            : 'bg-zinc-400';

  const statusLabel =
    status === 'running'
      ? 'Running'
      : status === 'error'
        ? 'Error'
        : status === 'crashed'
          ? 'Crashed'
          : status === 'no-chrome'
            ? 'Setup required'
            : status === 'checking'
              ? 'Checking...'
              : 'Stopped';

  // --- Chrome not installed ---
  if (status === 'no-chrome') {
    return (
      <div className="flex h-full flex-col gap-2.5 p-3">
        <div className="flex items-center gap-2">
          <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusDot}`} />
          <span className="text-sm font-semibold">Browser</span>
          <span className="ml-auto text-[11px] text-muted-foreground">{statusLabel}</span>
        </div>
        <p className="text-xs leading-snug text-muted-foreground">
          Chrome is not installed. Install it to use browser automation.
        </p>
        <button
          onClick={handleInstallChrome}
          disabled={installing || !sdk}
          className="inline-flex h-8 items-center justify-center rounded-md bg-primary px-3.5 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
        >
          {installing ? 'Installing...' : 'Install Chrome'}
        </button>
      </div>
    );
  }

  // --- Normal widget ---
  return (
    <div className="flex h-full flex-col gap-2 p-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className={`inline-block h-2 w-2 shrink-0 rounded-full ${statusDot}`} />
        <span className="text-sm font-semibold">Browser</span>
        <span className="ml-auto text-[11px] text-muted-foreground">{statusLabel}</span>
      </div>

      {/* Page info */}
      {status === 'running' && (pageTitle || currentUrl) && (
        <div className="flex flex-col gap-0.5">
          {pageTitle && <span className="truncate text-[13px] font-medium">{pageTitle}</span>}
          {currentUrl && (
            <span className="truncate font-mono text-[11px] text-muted-foreground">
              {currentUrl}
            </span>
          )}
        </div>
      )}

      {/* Crashed message */}
      {status === 'crashed' && (
        <p className="text-xs text-destructive">Browser crashed or became unreachable.</p>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Actions */}
      <div className="flex gap-1.5">
        {status === 'running' ? (
          <button
            onClick={() => void handleRefresh()}
            disabled={loading}
            className="inline-flex h-[30px] items-center justify-center rounded-md border border-border bg-transparent px-3 text-xs font-medium disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        ) : (
          <button
            onClick={() => void handleLaunch()}
            disabled={loading || !sdk || status === 'checking'}
            className="inline-flex h-[30px] items-center justify-center rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Starting...' : status === 'crashed' ? 'Restart' : 'Launch'}
          </button>
        )}
      </div>
    </div>
  );
}
