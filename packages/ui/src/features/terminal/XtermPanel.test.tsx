import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup, act } from '@testing-library/react';
import { XtermPanel } from './XtermPanel';

const mockTerminalOpen = vi.fn();
const mockTerminalWrite = vi.fn();
const mockTerminalDispose = vi.fn();
const mockTerminalLoadAddon = vi.fn();
const mockOnData = vi.fn();
const mockOnResize = vi.fn();
const mockFit = vi.fn();

vi.mock('@xterm/xterm', () => {
  class MockTerminal {
    open = mockTerminalOpen;
    write = mockTerminalWrite;
    dispose = mockTerminalDispose;
    loadAddon = mockTerminalLoadAddon;
    cols = 80;
    rows = 24;
    onData(cb: (data: string) => void) {
      mockOnData(cb);
      return { dispose: vi.fn() };
    }
    onResize(cb: (size: { cols: number; rows: number }) => void) {
      mockOnResize(cb);
      return { dispose: vi.fn() };
    }
  }
  return { Terminal: MockTerminal };
});

vi.mock('@xterm/addon-fit', () => {
  class MockFitAddon {
    fit = mockFit;
  }
  return { FitAddon: MockFitAddon };
});

const mockGetActiveProjectPath = vi.fn<[], string | null>().mockReturnValue('/test/project');
vi.mock('@/core/api/client', () => ({
  getActiveProjectPath: () => mockGetActiveProjectPath(),
}));

const mockRegisterSender = vi.fn();
const mockUnregisterSender = vi.fn();
vi.mock('./use-terminal', () => ({
  useTerminal: () => ({
    isOpen: true,
    open: vi.fn(),
    close: vi.fn(),
    toggle: vi.fn(),
    send: vi.fn(),
    registerSender: mockRegisterSender,
    unregisterSender: mockUnregisterSender,
  }),
}));

class MockWebSocket {
  static OPEN = 1;
  url: string;
  readyState = MockWebSocket.OPEN;
  onopen: (() => void) | null = null;
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;
  send = vi.fn();
  close = vi.fn();

  constructor(url: string) {
    this.url = url;
  }
}

let mockWsInstance: MockWebSocket;

function triggerOpen() {
  act(() => {
    mockWsInstance.onopen?.();
  });
}

describe('XtermPanel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetActiveProjectPath.mockReturnValue('/test/project');
    const WsConstructor = vi.fn((url: string) => {
      mockWsInstance = new MockWebSocket(url);
      return mockWsInstance;
    });
    // Expose the static OPEN constant that the code checks
    Object.defineProperty(WsConstructor, 'OPEN', { value: 1 });
    vi.stubGlobal('WebSocket', WsConstructor);
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it('renders a container div', () => {
    const { container } = render(<XtermPanel />);
    expect(container.firstElementChild).toBeDefined();
    expect(container.firstElementChild?.className).toContain('h-full');
  });

  it('creates Terminal and opens it on mount', () => {
    render(<XtermPanel />);
    expect(mockTerminalOpen).toHaveBeenCalledOnce();
  });

  it('loads FitAddon', () => {
    render(<XtermPanel />);
    expect(mockTerminalLoadAddon).toHaveBeenCalledOnce();
  });

  it('connects WebSocket with project path', () => {
    render(<XtermPanel />);
    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('/api/terminal?project=%2Ftest%2Fproject'),
    );
  });

  it('registers onData handler for user input', () => {
    render(<XtermPanel />);
    expect(mockOnData).toHaveBeenCalledOnce();
    expect(typeof mockOnData.mock.calls[0]![0]).toBe('function');
  });

  it('registers onResize handler', () => {
    render(<XtermPanel />);
    expect(mockOnResize).toHaveBeenCalledOnce();
    expect(typeof mockOnResize.mock.calls[0]![0]).toBe('function');
  });

  it('sends user input through WebSocket', () => {
    render(<XtermPanel />);
    triggerOpen();

    const dataCallback = mockOnData.mock.calls[0]![0] as (data: string) => void;
    act(() => {
      dataCallback('hello');
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith('hello');
  });

  it('writes WebSocket messages to terminal', () => {
    render(<XtermPanel />);
    triggerOpen();

    act(() => {
      mockWsInstance.onmessage?.({ data: 'output from shell' });
    });

    expect(mockTerminalWrite).toHaveBeenCalledWith('output from shell');
  });

  it('writes session ended message on WebSocket close', () => {
    render(<XtermPanel />);
    triggerOpen();

    act(() => {
      mockWsInstance.onclose?.();
    });

    expect(mockTerminalWrite).toHaveBeenCalledWith(expect.stringContaining('Terminal session ended'));
  });

  it('disposes terminal and closes WebSocket on unmount', () => {
    const { unmount } = render(<XtermPanel />);
    unmount();
    expect(mockWsInstance.close).toHaveBeenCalled();
    expect(mockTerminalDispose).toHaveBeenCalled();
  });

  it('sends resize message on open with terminal dimensions', () => {
    render(<XtermPanel />);
    triggerOpen();

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'resize', cols: 80, rows: 24 }),
    );
  });

  it('connects without project query param when no active project', () => {
    mockGetActiveProjectPath.mockReturnValueOnce(null);
    render(<XtermPanel />);
    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringMatching(/\/api\/terminal$/),
    );
  });

  it('does not send data when WebSocket is not open', () => {
    render(<XtermPanel />);

    // Set readyState to CLOSED before triggering data
    mockWsInstance.readyState = 3;

    const dataCallback = mockOnData.mock.calls[0]![0] as (data: string) => void;
    act(() => {
      dataCallback('hello');
    });

    expect(mockWsInstance.send).not.toHaveBeenCalled();
  });

  it('sends resize when terminal.onResize fires', () => {
    render(<XtermPanel />);
    triggerOpen();

    // Clear the initial resize sent on open
    mockWsInstance.send.mockClear();

    const resizeCallback = mockOnResize.mock.calls[0]![0] as (size: { cols: number; rows: number }) => void;
    act(() => {
      resizeCallback({ cols: 120, rows: 40 });
    });

    expect(mockWsInstance.send).toHaveBeenCalledWith(
      JSON.stringify({ type: 'resize', cols: 120, rows: 40 }),
    );
  });

  it('does not send resize when WebSocket is not open', () => {
    render(<XtermPanel />);

    mockWsInstance.readyState = 3;

    const resizeCallback = mockOnResize.mock.calls[0]![0] as (size: { cols: number; rows: number }) => void;
    act(() => {
      resizeCallback({ cols: 120, rows: 40 });
    });

    expect(mockWsInstance.send).not.toHaveBeenCalled();
  });

  it('registers sender on WebSocket open', () => {
    render(<XtermPanel />);
    triggerOpen();

    expect(mockRegisterSender).toHaveBeenCalledOnce();
    expect(typeof mockRegisterSender.mock.calls[0]![0]).toBe('function');
  });

  it('registered sender sends data through WebSocket', () => {
    render(<XtermPanel />);
    triggerOpen();

    const sender = mockRegisterSender.mock.calls[0]![0] as (data: string) => void;
    sender('echo test\n');

    expect(mockWsInstance.send).toHaveBeenCalledWith('echo test\n');
  });

  it('unregisters sender on unmount', () => {
    const { unmount } = render(<XtermPanel />);
    unmount();

    expect(mockUnregisterSender).toHaveBeenCalledOnce();
  });

  it('uses wss protocol for https pages', () => {
    const originalProtocol = window.location.protocol;
    const originalHost = window.location.host;

    Object.defineProperty(window, 'location', {
      value: { protocol: 'https:', host: 'localhost:4201' },
      writable: true,
      configurable: true,
    });

    render(<XtermPanel />);

    expect(WebSocket).toHaveBeenCalledWith(
      expect.stringContaining('wss://'),
    );

    // Restore
    Object.defineProperty(window, 'location', {
      value: { protocol: originalProtocol, host: originalHost },
      writable: true,
      configurable: true,
    });
  });
});
