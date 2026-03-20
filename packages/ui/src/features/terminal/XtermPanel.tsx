import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useProjectContext } from '@/core/providers/ProjectProvider';
import { useTerminal } from './use-terminal';
import '@xterm/xterm/css/xterm.css';

function buildWsUrl(): string {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${protocol}//${window.location.host}/api/terminal`;
}

function sendJson(ws: WebSocket, data: Record<string, unknown>): void {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }
}

function tryParseJson(raw: string): Record<string, unknown> | null {
  try {
    const parsed: unknown = JSON.parse(raw);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed as Record<string, unknown>;
    }
    return null;
  } catch {
    return null;
  }
}

export function XtermPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const { registerSender, unregisterSender } = useTerminal();
  const { activeProject } = useProjectContext();

  // Effect 1: Create Terminal + FitAddon on mount, dispose on unmount
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const terminal = new Terminal({
      cursorBlink: true,
      fontSize: 13,
      fontFamily: 'Menlo, Monaco, "Courier New", monospace',
      theme: {
        background: '#1a1a2e',
        foreground: '#e0e0e0',
        cursor: '#e0e0e0',
      },
    });

    const fitAddon = new FitAddon();
    terminal.loadAddon(fitAddon);
    terminal.open(container);

    terminalRef.current = terminal;
    fitAddonRef.current = fitAddon;

    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    });
    resizeObserver.observe(container);
    resizeObserverRef.current = resizeObserver;

    return () => {
      resizeObserver.disconnect();
      terminal.dispose();
      terminalRef.current = null;
      fitAddonRef.current = null;
      resizeObserverRef.current = null;
    };
  }, []);

  // Effect 2: Connect WebSocket per project, reconnect on project change
  useEffect(() => {
    const terminal = terminalRef.current;
    if (!terminal) return;

    terminal.clear();
    terminal.reset();

    const ws = new WebSocket(buildWsUrl());

    ws.onopen = () => {
      sendJson(ws, {
        type: 'init',
        ...(activeProject ? { projectPath: activeProject } : {}),
        cols: terminal.cols,
        rows: terminal.rows,
      });
      registerSender((data: string) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(data);
        }
      });
    };

    ws.onmessage = (event: MessageEvent) => {
      const raw = String(event.data);
      const parsed = tryParseJson(raw);
      if (parsed?.['type'] === 'session-replay') {
        terminal.write(String(parsed['data']));
        return;
      }
      if (parsed?.['type'] === 'session-info') {
        return; // consume silently
      }
      terminal.write(raw);
    };

    let disposed = false;

    ws.onclose = () => {
      if (!disposed) {
        terminal.write('\r\n\x1b[90m[Terminal session ended]\x1b[0m\r\n');
      }
    };

    const dataDisposable = terminal.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    const resizeDisposable = terminal.onResize(({ cols, rows }) => {
      sendJson(ws, { type: 'resize', cols, rows });
    });

    return () => {
      disposed = true;
      unregisterSender();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      ws.close();
    };
  }, [activeProject, registerSender, unregisterSender]);

  return <div ref={containerRef} className="h-full w-full" />;
}
