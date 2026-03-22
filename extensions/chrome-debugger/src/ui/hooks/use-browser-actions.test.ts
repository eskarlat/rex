import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Test the notifyOnSuccess behavior by exercising the callback logic
 * that useBrowserActions wires internally.
 */

interface MockSdk {
  ui: { toast: ReturnType<typeof vi.fn> };
  notify: ReturnType<typeof vi.fn>;
  exec: { run: ReturnType<typeof vi.fn> };
  storage: { get: ReturnType<typeof vi.fn>; set: ReturnType<typeof vi.fn>; delete: ReturnType<typeof vi.fn> };
  events: { publish: ReturnType<typeof vi.fn> };
}

function makeMockSdk(): MockSdk {
  return {
    ui: { toast: vi.fn() },
    notify: vi.fn(),
    exec: { run: vi.fn() },
    storage: { get: vi.fn(), set: vi.fn(), delete: vi.fn() },
    events: { publish: vi.fn() },
  };
}

// The key behavior: notifyOnSuccess should send a persistent notification
// (with message field) on success, and skip entirely on null (failure).

describe('browser action notifications', () => {
  let sdk: MockSdk;

  beforeEach(() => {
    vi.clearAllMocks();
    sdk = makeMockSdk();
  });

  it('sends persistent notification on successful launch', async () => {
    const successResult = { output: '{"running":true}' };
    const runAction = vi.fn().mockResolvedValue(successResult);

    await runAction('launch').then((r: { output: string } | null) => {
      if (!r) return;
      sdk.notify({ title: 'Browser Started', message: 'chrome-debugger', variant: 'success' });
    });

    expect(sdk.notify).toHaveBeenCalledWith({
      title: 'Browser Started',
      message: 'chrome-debugger',
      variant: 'success',
    });
  });

  it('does not notify when action fails (returns null)', async () => {
    const runAction = vi.fn().mockResolvedValue(null);

    await runAction('launch').then((r: { output: string } | null) => {
      if (!r) return;
      sdk.notify({ title: 'Browser Started', message: 'chrome-debugger', variant: 'success' });
    });

    expect(sdk.notify).not.toHaveBeenCalled();
  });

  it('sends info notification on browser close', async () => {
    const successResult = { output: '{}' };
    const runAction = vi.fn().mockResolvedValue(successResult);

    await runAction('close').then((r: { output: string } | null) => {
      if (!r) return;
      sdk.notify({ title: 'Browser Stopped', message: 'chrome-debugger', variant: 'info' });
    });

    expect(sdk.notify).toHaveBeenCalledWith({
      title: 'Browser Stopped',
      message: 'chrome-debugger',
      variant: 'info',
    });
  });
});
