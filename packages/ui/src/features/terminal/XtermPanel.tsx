import { useEffect, useRef } from 'react';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { getActiveProjectPath } from '@/core/api/client';
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

export function XtermPanel() {
  const containerRef = useRef<HTMLDivElement>(null);
  const terminalRef = useRef<Terminal | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const { registerSender, unregisterSender } = useTerminal();

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

    // Fit after a frame so the container has dimensions
    requestAnimationFrame(() => {
      fitAddon.fit();
    });

    const ws = new WebSocket(buildWsUrl());
    wsRef.current = ws;

    ws.onopen = () => {
      // Send init message with project path so the server spawns the PTY in the right cwd
      const projectPath = getActiveProjectPath();
      sendJson(ws, {
        type: 'init',
        ...(projectPath ? { projectPath } : {}),
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
      terminal.write(String(event.data));
    };

    ws.onclose = () => {
      terminal.write('\r\n\x1b[90m[Terminal session ended]\x1b[0m\r\n');
    };

    // Send user input to PTY
    const dataDisposable = terminal.onData((data: string) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    });

    // Handle resize
    const resizeDisposable = terminal.onResize(({ cols, rows }) => {
      sendJson(ws, { type: 'resize', cols, rows });
    });

    // Observe container size changes
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => {
        fitAddon.fit();
      });
    });
    resizeObserver.observe(container);

    return () => {
      unregisterSender();
      resizeObserver.disconnect();
      dataDisposable.dispose();
      resizeDisposable.dispose();
      ws.close();
      terminal.dispose();
      terminalRef.current = null;
      wsRef.current = null;
      fitAddonRef.current = null;
    };
  }, [registerSender, unregisterSender]);

  return <div ref={containerRef} className="h-full w-full" />;
}
