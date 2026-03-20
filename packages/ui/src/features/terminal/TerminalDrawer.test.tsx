import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TerminalDrawer } from './TerminalDrawer';

const mockClose = vi.fn();
const mockOpen = vi.fn();
const mockToggle = vi.fn();
let mockIsOpen = false;

vi.mock('./use-terminal', () => ({
  useTerminal: () => ({
    isOpen: mockIsOpen,
    open: mockOpen,
    close: mockClose,
    toggle: mockToggle,
    send: vi.fn(),
    registerSender: vi.fn(),
    unregisterSender: vi.fn(),
  }),
}));

let mockActiveProject: string | null = null;
vi.mock('@/core/providers/ProjectProvider', () => ({
  useProjectContext: () => ({
    activeProject: mockActiveProject,
    setActiveProject: vi.fn(),
  }),
}));

vi.mock('./XtermPanel', () => ({
  XtermPanel: () => <div data-testid="xterm-panel" />,
}));

describe('TerminalDrawer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockIsOpen = false;
    mockActiveProject = null;
  });

  it('renders with zero width when closed', () => {
    const { container } = render(<TerminalDrawer />);
    const drawer = container.firstElementChild;
    expect(drawer).toBeDefined();
    expect(drawer?.className).toContain('w-0');
  });

  it('does not render terminal content when closed', () => {
    render(<TerminalDrawer />);
    expect(screen.queryByText('Terminal')).not.toBeInTheDocument();
    expect(screen.queryByTestId('xterm-panel')).not.toBeInTheDocument();
  });

  it('renders with inline width style when open', () => {
    mockIsOpen = true;
    const { container } = render(<TerminalDrawer />);
    const drawer = container.firstElementChild as HTMLElement;
    expect(drawer.style.width).toBe('480px');
  });

  it('renders terminal header and XtermPanel when open', () => {
    mockIsOpen = true;
    render(<TerminalDrawer />);
    expect(screen.getByText('Terminal')).toBeInTheDocument();
    expect(screen.getByTestId('xterm-panel')).toBeInTheDocument();
  });

  it('renders close button when open', () => {
    mockIsOpen = true;
    render(<TerminalDrawer />);
    expect(screen.getByLabelText('Close terminal')).toBeInTheDocument();
  });

  it('calls close when close button is clicked', async () => {
    mockIsOpen = true;
    render(<TerminalDrawer />);
    await userEvent.click(screen.getByLabelText('Close terminal'));
    expect(mockClose).toHaveBeenCalledOnce();
  });

  it('renders resize handle when open', () => {
    mockIsOpen = true;
    render(<TerminalDrawer />);
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('does not render resize handle when closed', () => {
    render(<TerminalDrawer />);
    expect(screen.queryByRole('separator')).not.toBeInTheDocument();
  });

  it('resizes on drag', () => {
    mockIsOpen = true;
    const { container } = render(<TerminalDrawer />);
    const handle = screen.getByRole('separator');
    const drawer = container.firstElementChild as HTMLElement;

    // Start at 480px, drag left by 100px to increase width
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(document, { clientX: 400 });
    fireEvent.mouseUp(document);

    expect(drawer.style.width).toBe('580px');
  });

  it('respects minimum width during resize', () => {
    mockIsOpen = true;
    const { container } = render(<TerminalDrawer />);
    const handle = screen.getByRole('separator');
    const drawer = container.firstElementChild as HTMLElement;

    // Drag right by a huge amount to try to shrink below min
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(document, { clientX: 1500 });
    fireEvent.mouseUp(document);

    expect(drawer.style.width).toBe('280px');
  });

  it('respects maximum width during resize', () => {
    mockIsOpen = true;
    const { container } = render(<TerminalDrawer />);
    const handle = screen.getByRole('separator');
    const drawer = container.firstElementChild as HTMLElement;

    // Drag left by a huge amount to try to grow beyond max
    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(document, { clientX: -2000 });
    fireEvent.mouseUp(document);

    expect(drawer.style.width).toBe('1200px');
  });

  it('stops resizing after mouseup', () => {
    mockIsOpen = true;
    const { container } = render(<TerminalDrawer />);
    const handle = screen.getByRole('separator');
    const drawer = container.firstElementChild as HTMLElement;

    fireEvent.mouseDown(handle, { clientX: 500 });
    fireEvent.mouseMove(document, { clientX: 400 });
    fireEvent.mouseUp(document);

    const widthAfterDrag = drawer.style.width;

    // Further mouse moves should not affect width (dragging.current is false)
    fireEvent.mouseMove(document, { clientX: 200 });
    expect(drawer.style.width).toBe(widthAfterDrag);
  });

  it('does not apply inline width style when closed', () => {
    const { container } = render(<TerminalDrawer />);
    const drawer = container.firstElementChild as HTMLElement;
    expect(drawer.style.width).toBe('');
  });

  it('shows project name when project is active', () => {
    mockIsOpen = true;
    mockActiveProject = '/home/user/my-project';
    render(<TerminalDrawer />);
    expect(screen.getByText('my-project')).toBeInTheDocument();
  });

  it('shows Home when no project is active', () => {
    mockIsOpen = true;
    mockActiveProject = null;
    render(<TerminalDrawer />);
    expect(screen.getByText('Home')).toBeInTheDocument();
  });
});
