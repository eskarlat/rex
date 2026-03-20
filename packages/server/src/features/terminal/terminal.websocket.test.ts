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

const INIT_MSG = JSON.stringify({ type: 'init' });

function initMsg(overrides: Record<string, unknown> = {}): string {
  return JSON.stringify({ type: 'init', ...overrides });
}

describe('terminal.websocket', () => {
  let app: FastifyInstance;

  beforeEach(async () => {
    vi.resetAllMocks();
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

  it('spawns PTY after receiving init message with default settings', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(INIT_MSG);
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

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cols: 80,
        rows: 24,
        name: 'xterm-256color',
      }),
    );
  });

  it('does not spawn PTY before init message', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        // Send non-init messages only
        ws.send('ls -la');
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
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('uses project path from init message as cwd', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/my-project' }));
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

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cwd: '/tmp/my-project',
      }),
    );
  });

  it('uses cols and rows from init message', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ cols: 120, rows: 40 }));
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

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cols: 120,
        rows: 40,
      }),
    );
  });

  it('falls back to homedir when no project path in init', async () => {
    const { homedir } = await import('node:os');
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(INIT_MSG);
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
        ws.send(INIT_MSG);
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
        // Wait for PTY data (not init ack)
        if (received.includes('hello from pty')) {
          ws.close();
          resolve();
        }
      };
      // After init is processed, simulate PTY sending data
      setTimeout(() => {
        if (dataCallback) {
          dataCallback('hello from pty');
        }
      }, 100);
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
        ws.send(INIT_MSG);
        // Send stdin after init is processed
        setTimeout(() => {
          ws.send('ls -la');
          setTimeout(() => {
            ws.close();
            resolve();
          }, 100);
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
        ws.send(INIT_MSG);
        setTimeout(() => {
          ws.send(JSON.stringify({ type: 'resize', cols: 120, rows: 40 }));
          setTimeout(() => {
            ws.close();
            resolve();
          }, 100);
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
        ws.send(INIT_MSG);
        setTimeout(() => {
          ws.close();
        }, 100);
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
        ws.send(INIT_MSG);
        // Simulate PTY exit after init
        setTimeout(() => {
          if (exitCallback) {
            exitCallback();
          }
        }, 100);
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

  it('sends error message and closes socket when PTY spawn fails', async () => {
    mockSpawn.mockImplementation(() => {
      throw new Error('posix_spawnp failed.');
    });

    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    const received: string[] = [];
    let closed = false;
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(INIT_MSG);
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
      };
      ws.onclose = () => {
        closed = true;
        resolve();
      };
      ws.onerror = () => {
        resolve();
      };
    });

    expect(closed).toBe(true);
    expect(received.some((msg) => msg.includes('Failed to start terminal'))).toBe(true);
    expect(received.some((msg) => msg.includes('posix_spawnp failed'))).toBe(true);
  });

  it('does not resize for invalid JSON messages after init', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(INIT_MSG);
        setTimeout(() => {
          ws.send('not json at all');
          ws.send(JSON.stringify({ type: 'other', data: 'stuff' }));
          setTimeout(() => {
            ws.close();
            resolve();
          }, 100);
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
