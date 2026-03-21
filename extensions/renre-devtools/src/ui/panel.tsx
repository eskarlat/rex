import { useState, useCallback, useEffect, useRef } from 'react';
import { Panel, CodeBlock, EmptyState } from '@renre-kit/extension-sdk/components';
import type { PanelProps } from '@renre-kit/extension-sdk';

interface ConsoleLine {
  type: string;
  text: string;
  timestamp: number;
}

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
    errorText.includes('Could not find Chrome') || errorText.includes('puppeteer browsers install')
  );
}

export default function BrowserDevtoolsPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'renre-devtools';

  const [chromeInstalled, setChromeInstalled] = useState<boolean | null>(sdk ? null : true);
  const [installing, setInstalling] = useState(false);
  const [browserRunning, setBrowserRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [navigateUrl, setNavigateUrl] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([]);
  const [jsCode, setJsCode] = useState('');
  const [evalResult, setEvalResult] = useState<string | null>(null);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState<string | null>(null);
  const [crashed, setCrashed] = useState(false);
  const loadingRef = useRef(false);

  // Check Chrome & browser state on mount — detect if browser is already running
  useEffect(() => {
    if (!sdk) return;
    let cancelled = false;
    void (async () => {
      try {
        const result = await sdk.exec.run(`${extName}:puppeteer_evaluate`, {
          script: 'JSON.stringify({ url: document.URL, title: document.title })',
        });
        if (cancelled) return;
        const { isError, text } = extractMcpText(result.output);
        if (isError && isChromeNotInstalled(text)) {
          setChromeInstalled(false);
        } else if (isError) {
          // Chrome is installed but browser is not running (evaluate failed on no page)
          setChromeInstalled(true);
        } else {
          // Browser is already running — evaluate succeeded
          setChromeInstalled(true);
          setBrowserRunning(true);
          try {
            const info = JSON.parse(text) as { url?: string; title?: string };
            setCurrentUrl(info.url ?? null);
            setPageTitle(info.title || null);
          } catch {
            // Page info parse failed — browser is running but page info unavailable
          }
        }
      } catch (err) {
        if (cancelled) return;
        const msg = err instanceof Error ? err.message : String(err);
        setChromeInstalled(!isChromeNotInstalled(msg));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [sdk, extName]);

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
            setChromeInstalled(true);
            if (!isError) {
              setBrowserRunning(true);
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

  const runTool = useCallback(
    async (tool: string, args: Record<string, unknown> = {}): Promise<string | null> => {
      if (!sdk) return null;
      setError(null);
      try {
        const result = await sdk.exec.run(`${extName}:${tool}`, args);
        const { text, isError } = extractMcpText(result.output);
        if (isError) {
          if (isChromeNotInstalled(text)) {
            setChromeInstalled(false);
            return null;
          }
          setError(text);
          return null;
        }
        return text;
      } catch (err: unknown) {
        const detail =
          err instanceof Error && 'body' in err
            ? ((err as Error & { body: { error?: string } }).body.error ?? err.message)
            : err instanceof Error
              ? err.message
              : `Failed to execute ${tool}`;
        if (isChromeNotInstalled(detail)) {
          setChromeInstalled(false);
          return null;
        }
        setError(detail);
        return null;
      }
    },
    [sdk, extName],
  );

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

  async function handleStartBrowser() {
    setLoading(true);
    const result = await runTool('puppeteer_navigate', { url: 'about:blank' });
    if (result !== null) {
      setBrowserRunning(true);
      setCrashed(false);
      setCurrentUrl('about:blank');
      sdk?.ui.toast({
        title: 'Browser started',
        description: 'Headed browser window is now open.',
      });
      loadingRef.current = false;
      setLoading(false);
      void fetchPageInfo();
    } else {
      setLoading(false);
    }
  }

  async function handleNavigate() {
    if (!navigateUrl.trim()) return;
    setLoading(true);
    const url = navigateUrl.trim();
    const result = await runTool('puppeteer_navigate', { url });
    if (result !== null) {
      setCurrentUrl(url);
      setScreenshotData(null);
      loadingRef.current = false;
      setLoading(false);
      void fetchPageInfo();
    } else {
      setLoading(false);
    }
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
        const info = JSON.parse(result) as { url?: string; title?: string };
        setCurrentUrl(info.url ?? currentUrl);
        setConsoleLogs((prev) => [
          ...prev,
          {
            type: 'info',
            text: `Page: ${info.title ?? 'Untitled'} — ${info.url ?? ''}`,
            timestamp: Date.now(),
          },
        ]);
      } catch (err) {
        console.warn('[renre-devtools] Failed to parse console result:', err);
        setConsoleLogs((prev) => [...prev, { type: 'info', text: result, timestamp: Date.now() }]);
      }
    }
    setLoading(false);
  }

  async function handleEvaluate() {
    if (!jsCode.trim()) return;
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
    setCrashed(false);
    setPageTitle(null);
    setCurrentUrl(null);
    setConsoleLogs([]);
    setScreenshotData(null);
    setEvalResult(null);
    sdk?.ui.toast({
      title: 'Browser stopped',
      description: 'Browser session ended. Start a new one to continue.',
    });
  }

  function handleRestartBrowser() {
    setCrashed(false);
    setError(null);
    void handleStartBrowser();
  }

  loadingRef.current = loading;

  // Health check polling
  useEffect(() => {
    if (!browserRunning || !sdk) return;
    const interval = setInterval(() => {
      if (loadingRef.current) return;
      void fetchPageInfo().then((alive) => {
        if (!alive) {
          setBrowserRunning(false);
          setCrashed(true);
          setError('Browser crashed or became unreachable.');
          setConsoleLogs((prev) => [
            ...prev,
            { type: 'error', text: 'Browser crashed or became unreachable.', timestamp: Date.now() },
          ]);
          sdk.ui.toast({
            title: 'Browser crashed',
            description: 'The browser is no longer responding.',
          });
        }
      });
    }, 10_000);
    return () => clearInterval(interval);
  }, [browserRunning, sdk, fetchPageInfo]);

  // --- Chrome not installed ---
  if (chromeInstalled === false) {
    return (
      <div className="flex flex-col gap-4">
        <Panel
          title="Browser Devtools"
          description="Chrome is required for browser automation."
        >
          <div className="flex flex-col gap-3">
            <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-4 text-sm">
              <p className="font-medium text-amber-600 dark:text-amber-400 mb-1">
                Chrome not found
              </p>
              <p className="text-muted-foreground text-xs">
                Puppeteer requires a Chrome browser to be installed. Click the button below to
                install it via the terminal.
              </p>
            </div>
            <button
              onClick={handleInstallChrome}
              disabled={installing || !sdk}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none self-start"
            >
              {installing ? 'Installing Chrome...' : 'Install Chrome'}
            </button>
            {installing && (
              <p className="text-xs text-muted-foreground">
                Installation is running in the terminal. This may take a minute...
              </p>
            )}
          </div>
        </Panel>
      </div>
    );
  }

  // --- Loading check ---
  if (chromeInstalled === null) {
    return (
      <div className="flex flex-col gap-4">
        <Panel
          title="Browser Devtools"
          description="Checking browser availability..."
        >
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
            Connecting to Puppeteer MCP server...
          </div>
        </Panel>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Help & Info */}
      <Panel
        title="Browser Devtools"
        description="Control a headed Puppeteer browser instance for site debugging, DOM inspection, and visual testing."
      >
        <div className="text-sm text-muted-foreground space-y-2">
          <p>
            This extension launches a real browser window you can see and interact with. Use the
            controls below to navigate, inspect pages, take screenshots, and run JavaScript.
          </p>
          <p>
            LLM skills are available for automated debugging — the AI can navigate pages, click
            elements, fill forms, inspect the DOM, and capture screenshots on your behalf.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${crashed ? 'bg-red-500' : browserRunning ? 'bg-emerald-500' : 'bg-zinc-400'}`}
            />
            <span className="text-xs">
              {crashed ? 'Browser crashed' : browserRunning ? 'Browser running' : 'Browser stopped'}
            </span>
            {pageTitle && (
              <span className="text-xs text-muted-foreground ml-1">
                — <span>{pageTitle}</span>
              </span>
            )}
          </div>
        </div>
      </Panel>

      {/* Browser Control */}
      <Panel title="Browser Control">
        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {!browserRunning ? (
              <button
                onClick={() => void handleStartBrowser()}
                disabled={loading || !sdk}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
              >
                {loading ? 'Starting...' : 'Open Browser'}
              </button>
            ) : (
              <button
                onClick={() => handleStopBrowser()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-destructive px-4 text-sm font-medium text-destructive-foreground shadow hover:bg-destructive/90"
              >
                Stop Browser
              </button>
            )}
          </div>
          {currentUrl && (
            <div className="text-xs text-muted-foreground">
              {pageTitle && <span className="font-medium">{pageTitle} — </span>}
              Current: <code className="bg-muted px-1 rounded">{currentUrl}</code>
            </div>
          )}
        </div>
      </Panel>

      {/* Navigation */}
      {browserRunning && (
        <Panel title="Navigate">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="https://example.com"
              value={navigateUrl}
              onChange={(e) => setNavigateUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') void handleNavigate();
              }}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <button
              onClick={() => void handleNavigate()}
              disabled={loading || !navigateUrl.trim()}
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
            >
              Go
            </button>
          </div>
        </Panel>
      )}

      {/* Actions */}
      {browserRunning && (
        <Panel title="Actions">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => void handleScreenshot()}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
            >
              Screenshot
            </button>
            <button
              onClick={() => void handleGetConsole()}
              disabled={loading}
              className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-4 text-sm font-medium shadow-sm hover:bg-accent hover:text-accent-foreground disabled:opacity-50 disabled:pointer-events-none"
            >
              Page Info
            </button>
          </div>
        </Panel>
      )}

      {/* Screenshot Preview */}
      {screenshotData && (
        <Panel title="Screenshot">
          <div className="rounded-md border border-input overflow-hidden">
            <img
              src={
                screenshotData.startsWith('data:')
                  ? screenshotData
                  : `data:image/png;base64,${screenshotData}`
              }
              alt="Browser screenshot"
              className="w-full h-auto"
            />
          </div>
        </Panel>
      )}

      {/* JavaScript Console */}
      {browserRunning && (
        <Panel title="JavaScript Console">
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="document.title"
                value={jsCode}
                onChange={(e) => setJsCode(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void handleEvaluate();
                }}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm font-mono placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              />
              <button
                onClick={() => void handleEvaluate()}
                disabled={loading || !jsCode.trim()}
                className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none whitespace-nowrap"
              >
                Run
              </button>
            </div>
            {evalResult && <CodeBlock code={evalResult} />}
          </div>
        </Panel>
      )}

      {/* Console Log */}
      {consoleLogs.length > 0 && (
        <Panel title="Console Output">
          <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
            {consoleLogs.map((log, index) => (
              <div
                key={`${log.timestamp}-${index}`}
                className="flex items-start gap-2 text-xs font-mono text-muted-foreground"
              >
                <span className="text-[10px] opacity-50 shrink-0">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
                <pre className="whitespace-pre-wrap break-all">{log.text}</pre>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* Crashed state */}
      {crashed && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4 text-sm">
          <p className="font-medium text-destructive mb-2">Browser crashed or became unreachable.</p>
          <button
            onClick={() => handleRestartBrowser()}
            disabled={loading || !sdk}
            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Restart Browser
          </button>
        </div>
      )}

      {/* Not connected state */}
      {!browserRunning && !error && !crashed && (
        <EmptyState
          title="No browser running"
          description="Click 'Open Browser' above to launch a headed Puppeteer browser instance. You'll be able to navigate pages, take screenshots, run JavaScript, and inspect the DOM."
        />
      )}

      {/* Error display */}
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}
    </div>
  );
}
