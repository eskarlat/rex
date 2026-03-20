import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import type { FastifyInstance } from 'fastify';
import websocket from '@fastify/websocket';
import projectScope from '../../core/middleware/project-scope.js';
import terminalWebsocket from './terminal.websocket.js';

const mockSpawn = vi.fn();
const mockOnData = vi.fn();
const mockOnExit = vi.fn();
const mockWrite = vi.fn();
const mockResize = vi.fn();
const mockKill = vi.fn();

vi.mock('node-pty', () => ({
  spawn: (...args: unknown[]) => {
    mockSpawn(...args);
    return {
      onData: (cb: (data: string) => void) => mockOnData(cb),
      onExit: (cb: () => void) => mockOnExit(cb),
      write: (data: string) => mockWrite(data),
      resize: (cols: number, rows: number) => mockResize(cols, rows),
      kill: () => mockKill(),
    };
  },
}));

describe('terminal.websocket', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.clearAllMocks();
    app = Fastify();
    await app.register(websocket);
    await app.register(projectScope);
    await app.register(terminalWebsocket);
    await app.ready();
  });

  afterEach(async () => {
    await app.close();
  });

  it('registers GET /api/terminal route', () => {
    const routes = app.printRoutes();
    expect(routes).toContain('api/terminal');
  });

  it('spawns PTY with project path from query param', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal?project=/test/project`);
      ws.onopen = () => {
        ws.close();
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    // Give the handler time to process
    await new Promise((r) => setTimeout(r, 100));

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cwd: '/test/project',
        cols: 80,
        rows: 24,
        name: 'xterm-256color',
      }),
    );
  });

  it('spawns PTY with project path from header when no query param', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`, {
        headers: { 'x-renrekit-project': '/header/project' },
      });
      ws.onopen = () => {
        ws.close();
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cwd: '/header/project',
      }),
    );
  });

  it('falls back to homedir when no project path', async () => {
    const { homedir } = await import('node:os');
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.close();
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cwd: homedir(),
      }),
    );
  });

  it('forwards PTY data to WebSocket', async () => {
    let dataCallback: ((data: string) => void) | undefined;
    mockOnData.mockImplementation((cb: (data: string) => void) => {
      dataCallback = cb;
    });

    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    const received: string[] = [];
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        // Simulate PTY sending data
        if (dataCallback) {
          dataCallback('hello from pty');
        }
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
        ws.close();
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    expect(received).toContain('hello from pty');
  });

  it('forwards WebSocket input to PTY stdin', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send('ls -la');
        // Give time for the message to propagate
        setTimeout(() => {
          ws.close();
          resolve();
        }, 100);
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockWrite).toHaveBeenCalledWith('ls -la');
  });

  it('handles resize messages from WebSocket', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(JSON.stringify({ type: 'resize', cols: 120, rows: 40 }));
        setTimeout(() => {
          ws.close();
          resolve();
        }, 100);
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockResize).toHaveBeenCalledWith(120, 40);
  });

  it('kills PTY on WebSocket close', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.close();
      };
      ws.onclose = () => {
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockKill).toHaveBeenCalled();
  });

  it('closes WebSocket when PTY exits', async () => {
    let exitCallback: (() => void) | undefined;
    mockOnExit.mockImplementation((cb: () => void) => {
      exitCallback = cb;
    });

    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    let closed = false;
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        // Simulate PTY exit
        if (exitCallback) {
          exitCallback();
        }
      };
      ws.onclose = () => {
        closed = true;
        resolve();
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    expect(closed).toBe(true);
  });

  it('does not resize for invalid JSON messages', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send('not json at all');
        ws.send(JSON.stringify({ type: 'other', data: 'stuff' }));
        setTimeout(() => {
          ws.close();
          resolve();
        }, 100);
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await new Promise((r) => setTimeout(r, 100));
    expect(mockResize).not.toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalledWith('not json at all');
    expect(mockWrite).toHaveBeenCalledWith(JSON.stringify({ type: 'other', data: 'stuff' }));
  });
});
