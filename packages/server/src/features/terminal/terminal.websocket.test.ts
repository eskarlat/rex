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

function wait(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
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

    await wait(100);

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

    await wait(100);
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

    await wait(100);

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

    await wait(100);

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

    await wait(100);

    expect(mockSpawn).toHaveBeenCalledWith(
      expect.any(String),
      [],
      expect.objectContaining({
        cwd: homedir(),
      }),
    );
  });

  it('falls back to homedir for relative project path', async () => {
    const { homedir } = await import('node:os');
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`, {
        headers: { 'x-renrekit-project': '../etc/passwd' },
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
        cwd: homedir(),
      }),
    );
  });

  it('falls back to homedir for path with traversal segments', async () => {
    const { homedir } = await import('node:os');
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`, {
        headers: { 'x-renrekit-project': '/home/user/../../../etc' },
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
        if (received.some((m) => m === 'hello from pty')) {
          ws.close();
          resolve();
        }
      };
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

    await wait(100);
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

    await wait(100);
    expect(mockResize).toHaveBeenCalledWith(120, 40);
  });

  it('does NOT kill PTY on socket close (session persists)', async () => {
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

    await wait(100);
    // PTY should NOT be killed — session manager idle timer handles it
    expect(mockKill).not.toHaveBeenCalled();
  });

  it('reconnect to same project reuses PTY (mockSpawn called once)', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    // First connection
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/same-project' }));
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

    await wait(100);

    // Second connection to same project
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/same-project' }));
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

    await wait(100);

    // Only spawned once — second connection reused the session
    expect(mockSpawn).toHaveBeenCalledOnce();
  });

  it('sends session-info with status new on first connect', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    const received: string[] = [];
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/info-test' }));
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
        const parsed = JSON.parse(String(event.data)) as { type: string };
        if (parsed.type === 'session-info') {
          ws.close();
          resolve();
        }
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    expect(received).toContain(JSON.stringify({ type: 'session-info', status: 'new' }));
  });

  it('sends session-info with status reconnected on second connect', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    // First connection
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/reconnect-test' }));
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

    await wait(100);

    // Second connection
    const received: string[] = [];
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/reconnect-test' }));
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
        const parsed = JSON.parse(String(event.data)) as { type: string };
        if (parsed.type === 'session-info') {
          ws.close();
          resolve();
        }
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    expect(received).toContain(JSON.stringify({ type: 'session-info', status: 'reconnected' }));
  });

  it('sends session-replay on reconnect', async () => {
    let dataCallback: ((data: string) => void) | undefined;
    mockOnData.mockImplementation((cb: (data: string) => void) => {
      dataCallback = cb;
    });

    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    // First connection — PTY produces some output
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/replay-test' }));
        setTimeout(() => {
          if (dataCallback) dataCallback('buffered output');
          setTimeout(() => {
            ws.close();
            resolve();
          }, 50);
        }, 100);
      };
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    await wait(100);

    // Second connection — should receive replay
    const received: string[] = [];
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/replay-test' }));
      };
      ws.onmessage = (event) => {
        received.push(String(event.data));
        try {
          const parsed = JSON.parse(String(event.data)) as { type: string };
          if (parsed.type === 'session-replay') {
            ws.close();
            resolve();
          }
        } catch {
          // Raw PTY data, ignore
        }
      };
      setTimeout(() => {
        // Timeout safety
        ws.close();
        resolve();
      }, 2000);
      ws.onerror = () => {
        ws.close();
        resolve();
      };
    });

    const replayMsg = received.find((m) => {
      try {
        const p = JSON.parse(m) as { type: string };
        return p.type === 'session-replay';
      } catch {
        return false;
      }
    });

    expect(replayMsg).toBeDefined();
    const parsed = JSON.parse(replayMsg!) as { type: string; data: string };
    expect(parsed.data).toContain('buffered output');
  });

  it('different projects get different PTYs', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/project-a' }));
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

    await wait(100);

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/project-b' }));
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

    await wait(100);

    expect(mockSpawn).toHaveBeenCalledTimes(2);
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

    await wait(100);
    expect(mockResize).not.toHaveBeenCalled();
    expect(mockWrite).toHaveBeenCalledWith('not json at all');
    expect(mockWrite).toHaveBeenCalledWith(JSON.stringify({ type: 'other', data: 'stuff' }));
  });

  it('clean shutdown kills all sessions', async () => {
    const address = await app.listen({ port: 0 });
    const wsUrl = address.replace('http', 'ws');

    // Open two connections to different projects
    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/shutdown-a' }));
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

    await wait(50);

    await new Promise<void>((resolve) => {
      const ws = new WebSocket(`${wsUrl}/api/terminal`);
      ws.onopen = () => {
        ws.send(initMsg({ projectPath: '/tmp/shutdown-b' }));
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

    await wait(50);

    // Close the app (triggers onClose hook → destroyAll)
    await app.close();

    expect(mockKill).toHaveBeenCalledTimes(2);
  });
});
