import { useState, useCallback } from 'react';
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
  } catch {
    return { text: raw, isError: false };
  }
}

export default function BrowserDevtoolsPanel({ sdk, extensionName }: Partial<PanelProps>) {
  const extName = extensionName ?? 'renre-devtools';

  const [browserRunning, setBrowserRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [navigateUrl, setNavigateUrl] = useState('');
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLine[]>([]);
  const [jsCode, setJsCode] = useState('');
  const [evalResult, setEvalResult] = useState<string | null>(null);
  const [screenshotData, setScreenshotData] = useState<string | null>(null);

  const runTool = useCallback(
    async (tool: string, args: Record<string, unknown> = {}): Promise<string | null> => {
      if (!sdk) return null;
      setError(null);
      try {
        const result = await sdk.exec.run(`${extName}:${tool}`, args);
        const { text, isError } = extractMcpText(result.output);
        if (isError) {
          setError(text);
          return null;
        }
        return text;
      } catch {
        setError(`Failed to execute ${tool}`);
        return null;
      }
    },
    [sdk, extName],
  );

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
    if (!navigateUrl.trim()) return;
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
      } catch {
        setConsoleLogs((prev) => [
          ...prev,
          { type: 'info', text: result, timestamp: Date.now() },
        ]);
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
    setCurrentUrl(null);
    setConsoleLogs([]);
    setScreenshotData(null);
    setEvalResult(null);
    sdk?.ui.toast({
      title: 'Browser stopped',
      description: 'Browser session ended. Start a new one to continue.',
    });
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
            This extension launches a real browser window you can see and interact with.
            Use the controls below to navigate, inspect pages, take screenshots, and run JavaScript.
          </p>
          <p>
            LLM skills are available for automated debugging — the AI can navigate pages,
            click elements, fill forms, inspect the DOM, and capture screenshots on your behalf.
          </p>
          <div className="flex items-center gap-1.5 mt-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${browserRunning ? 'bg-green-500' : 'bg-gray-400'}`}
            />
            <span className="text-xs">
              {browserRunning ? 'Browser running' : 'Browser stopped'}
            </span>
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
              src={screenshotData.startsWith('data:') ? screenshotData : `data:image/png;base64,${screenshotData}`}
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
            {consoleLogs.map((log) => (
              <div
                key={log.timestamp}
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

      {/* Not connected state */}
      {!browserRunning && !error && (
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
